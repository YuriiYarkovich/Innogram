import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { MessagesService } from '../messages/messages.service';
import { ChatService } from './chat.service';
import { Server, Socket } from 'socket.io';
import { UserInAccessToken } from '../../common/types/user.type';
import { AuthService } from '../auth/auth.service';
import * as cookie from 'cookie';
import type {
  MessageReceiver,
  ReceivingMessage,
  ReturningMessageData,
} from '../../common/types/message.type';
import { File as MulterFile } from 'multer';
import { Logger } from 'nestjs-pino';
import { MessageReadStatus } from '../../common/enums/message.enum';
import { CreateMessageDto } from '../messages/dto/create-message.dto';
import { MinioService } from '../minio/minio.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { ReturningChatData } from '../../common/types/chat.types';
import { EditMessageDto } from '../messages/dto/edit-message.dto';

@WebSocketGateway(3004, { cors: { origin: '*', credentials: true } })
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly chatService: ChatService,
    private readonly authService: AuthService,
    private readonly minioService: MinioService,
    private readonly logger: Logger,
  ) {}

  @WebSocketServer() private server: Server;
  private allConnectedUsers = new Map<string, string>(); // {profileId; socketId}
  private chatUsers = new Map<string, Set<string>>(); //{chatId; Set<profileId>}
  private userChats = new Map<string, Set<string>>();

  async handleConnection(socket: Socket): Promise<void> {
    try {
      const cookiesHeader: string | undefined = socket.handshake.headers.cookie;
      if (!cookiesHeader) {
        this.logger.log(`No cookies found in handshake! Disconnect`);
        socket.disconnect();
        return;
      }

      const cookies: Record<string, string | undefined> =
        cookie.parse(cookiesHeader);
      const accessToken: string | undefined = cookies['accessToken'];

      if (!accessToken) {
        this.logger.log(`No access token provided! Disconnect`);
        socket.disconnect();
        return;
      }
      const user: UserInAccessToken =
        await this.authService.validateAccessToken(accessToken);
      const profileId: string = user.profileId;

      this.allConnectedUsers.set(profileId, socket.id);
      this.logger.log(
        `Client connected! ProfileId(key): ${user.profileId}, socketId:${socket.id}`,
      );
    } catch (e) {
      socket.disconnect();
      if (e instanceof HttpException || e.message === `Access token expired!`)
        throw new UnauthorizedException(`Access token expired!`);
      throw e;
    }
  }

  @SubscribeMessage('enteredChat')
  handleEnteringChat(socket: Socket, data: { chatId: string }) {
    const profileId = this.getProfileIdBySocketId(socket.id);

    if (!profileId)
      throw new InternalServerErrorException(
        'Something went wrong while handling entering to chat',
      );

    if (!this.chatUsers.has(data.chatId)) {
      this.chatUsers.set(data.chatId, new Set());
    }
    //add to chatUsers
    this.chatUsers.get(data.chatId)?.add(profileId);

    if (!this.userChats.has(profileId))
      this.userChats.set(profileId, new Set());
    this.userChats.get(profileId)?.add(data.chatId);
  }

  @SubscribeMessage('exitChat')
  handleExitChat(socket: Socket, data: { chatId: string }) {
    const profileId = this.getProfileIdBySocketId(socket.id);

    if (!profileId)
      throw new InternalServerErrorException(
        'Something went wrong while handling exiting to chat',
      );
    this.logger.log(
      `Profile with id: ${profileId} has exited chat with id: ${data.chatId}`,
    );
    this.chatUsers.get(data.chatId)?.delete(profileId);
    this.userChats.get(profileId)?.delete(data.chatId);
  }

  @SubscribeMessage(`message`)
  async handleMessage(client: Socket, receivedMessage: ReceivingMessage) {
    const connectedToChatSockets: string[] = [];
    const notConnectedToChatSockets: string[] = [];
    const messageReceivers: MessageReceiver[] = [];

    //const file = this.createFileFromPayload(payload.file);
    const files: MulterFile[] = [];
    if (receivedMessage.files) {
      for (const file of receivedMessage.files) {
        const mFile = this.createFileFromPayload(file);
        files.push(mFile);
      }
    }

    let allReceiversProfileIds: string[] = [];
    //in next block -- finding chat id
    if (!receivedMessage.receiverId && receivedMessage.chatId) {
      allReceiversProfileIds = await this.getAllChatParticipantsIds(
        receivedMessage.chatId,
      );
    } else if (!receivedMessage.chatId && receivedMessage.receiverId) {
      //trying to get the chat
      const chat = await this.chatService.getPrivateChatByIds(
        receivedMessage.senderId,
        receivedMessage.receiverId,
      );
      if (chat) {
        receivedMessage.chatId = chat.id;
      } else {
        //if there are no chat - creating it
        const dto: CreateChatDto = {
          otherParticipantsIds: [receivedMessage.receiverId],
        };
        const createdChat = await this.chatService.createChat(
          dto,
          receivedMessage.senderId,
        );
        receivedMessage.chatId = createdChat.id;
      }
      allReceiversProfileIds.push(receivedMessage.receiverId);
    } else if (!receivedMessage.chatId && !receivedMessage.receiverId) {
      throw new BadRequestException(
        'There are nor chatId and receiverId in received message!',
      );
    }

    if (!receivedMessage.chatId)
      throw new InternalServerErrorException(
        'Something went wrong while setting chat id',
      );

    for (const receiverProfileId of allReceiversProfileIds) {
      const socketId = this.getSocketIdByProfileId(receiverProfileId);
      if (socketId) {
        if (
          this.chatUsers.get(receivedMessage.chatId)?.has(receiverProfileId) //connected to chat users
        ) {
          connectedToChatSockets.push(socketId);
          messageReceivers.push({
            profileId: receiverProfileId,
            readStatus: MessageReadStatus.READ,
          });
        } else {
          //connected to server but not to chat
          notConnectedToChatSockets.push(socketId);
          messageReceivers.push({
            profileId: receiverProfileId,
            readStatus: MessageReadStatus.UNREAD,
          });
        }
      } //if user is not connected to server at all
      else
        messageReceivers.push({
          profileId: receiverProfileId,
          readStatus: MessageReadStatus.UNREAD,
        });
    }

    const dto: CreateMessageDto = {
      senderId: receivedMessage.senderId,
      chatId: receivedMessage.chatId,
      content: receivedMessage.content,
      replyToMessageId: receivedMessage.replyToMessageId,
    };

    const returningMessage = await this.messagesService.createMessage(
      dto,
      receivedMessage.senderId,
      messageReceivers,
      files,
    );

    connectedToChatSockets.forEach((socketId) => {
      this.server.to(socketId).emit('messageToUserInChat', returningMessage);
    });

    notConnectedToChatSockets.forEach((socketId) => {
      if (returningMessage.read === MessageReadStatus.READ)
        returningMessage.read = MessageReadStatus.UNREAD;
      this.server.to(socketId).emit('messageToUserInServer', returningMessage);
    });
  }

  @SubscribeMessage('editMessage')
  async handleMessageEditing(client: Socket, editingMessage: ReceivingMessage) {
    if (!editingMessage.chatId || !editingMessage.id)
      throw new BadRequestException(
        'No chat id or message id provided in received editing message!',
      );

    const chatParticipants = await this.getAllChatParticipantsIds(
      editingMessage?.chatId,
    );

    const dto: EditMessageDto = { content: editingMessage.content };
    const currentProfileId = this.getProfileIdBySocketId(client.id);

    if (!currentProfileId)
      throw new InternalServerErrorException(
        'Something went wrong while getting profile id by socket id',
      );
    const updatedMessage = await this.messagesService.editMessage(
      editingMessage.id,
      dto,
      currentProfileId,
      editingMessage.files,
    );

    const connectedToChatParticipantsSocketsIds =
      this.getAllConnectedToChatSocketsFromGivenProfiles(
        editingMessage.chatId,
        chatParticipants,
      );

    const connectedToServerChatParticipantsSocketIds =
      this.getAllConnectedToServerSocketsFromGivenProfiles(chatParticipants);
    connectedToChatParticipantsSocketsIds.forEach(
      (connectedToChatParticipantId) => {
        this.server
          .to(connectedToChatParticipantId)
          .emit('messageEditedInChat', updatedMessage);
      },
    );

    connectedToServerChatParticipantsSocketIds.forEach(
      (connectedToServerChatParticipant) => {
        this.server
          .to(connectedToServerChatParticipant)
          .emit('messageEditedInServer', updatedMessage);
      },
    );
  }

  @SubscribeMessage(`deleteMessage`)
  async handleMessageDeletion(
    client: Socket,
    receivedMessage: ReceivingMessage,
  ) {
    if (!receivedMessage.chatId)
      throw new BadRequestException(
        'There are no chat id in received message on trying to delete!',
      );

    const chatParticipantsIds: string[] = await this.getAllChatParticipantsIds(
      receivedMessage.chatId,
    );

    const connectedToChatSockets: string[] =
      this.getAllConnectedToChatSocketsFromGivenProfiles(
        receivedMessage.chatId,
        chatParticipantsIds,
      );

    if (!receivedMessage.id)
      throw new BadRequestException(
        'There are no message id provided when trying to delete message!',
      );
    await this.messagesService.deleteMessage(receivedMessage?.id);

    connectedToChatSockets.forEach((socketId) => {
      this.server.to(socketId).emit('messageDeleted', receivedMessage?.id);
    });
  }

  @SubscribeMessage('createChat')
  async handleChatCreation(
    @MessageBody()
    payload: {
      dto: CreateChatDto;
      currentProfileId: string;
      file?: {
        buffer: ArrayBuffer;
        originalname: string;
        mimetype: string;
        size: number;
      };
    },
  ) {
    const file = this.createFileFromPayload(payload.file);
    const createdChat = await this.chatService.createChat(
      payload.dto,
      payload.currentProfileId,
      file,
    );
    const chatParticipantsIds = await this.getAllChatParticipantsIds(
      createdChat.id,
    );

    const onlineChatParticipantsSocketsIds =
      this.getAllConnectedToServerSocketsFromGivenProfiles(chatParticipantsIds);
    onlineChatParticipantsSocketsIds.forEach(
      (onlineChatParticipantsSocketsId) => {
        this.server
          .to(onlineChatParticipantsSocketsId)
          .emit('chatCreated', createdChat);
      },
    );
  }

  @SubscribeMessage('editChat')
  async handleEditChat(
    @MessageBody()
    payload: {
      chatId: string;
      title: string;
      file?: {
        buffer: ArrayBuffer;
        originalname: string;
        mimetype: string;
        size: number;
      };
      currentProfileId: string;
    },
    client: Socket,
  ) {
    const file = this.createFileFromPayload(payload.file);
    const updatedChat = await this.chatService.updateChatTitle(
      payload.chatId,
      payload.title,
      payload.currentProfileId,
      file,
    );
    if (!updatedChat)
      throw new InternalServerErrorException(
        'Something went wrong while updating chat!',
      );

    const newChatAvatarFilename = await this.minioService.getPublicUrl(
      updatedChat.avatarFilename,
    );

    const lastMessageOfChat = await this.messagesService.getLastMessageOfChat(
      updatedChat.id,
      payload.currentProfileId,
    );
    const returningUpdatedChat: ReturningChatData = {
      ...updatedChat,
      avatarUrl: newChatAvatarFilename,
      lastMessageId: lastMessageOfChat?.id,
      lastMessageContent: lastMessageOfChat?.content,
      lastMessageCreatedAt: lastMessageOfChat?.createdAt,
      lastMessageRead: lastMessageOfChat?.read,
    };

    const chatParticipantsProfilesIds = await this.getAllChatParticipantsIds(
      updatedChat?.id,
    );

    const connectedToServerSockets =
      this.getAllConnectedToServerSocketsFromGivenProfiles(
        chatParticipantsProfilesIds,
      );

    connectedToServerSockets.forEach((connectedToServerSocket) => {
      this.server
        .to(connectedToServerSocket)
        .emit('chatUpdated', returningUpdatedChat);
    });
  }

  @SubscribeMessage('deleteChat')
  async handleChatDeletion(
    client: Socket,
    data: { chat: ReturningChatData; currentProfileId: string },
  ) {
    const currentProfileId = this.getProfileIdBySocketId(client.id);
    if (!currentProfileId)
      throw new InternalServerErrorException(`Can't find connected user`);
    await this.chatService.deleteChat(data.chat.id, currentProfileId);
    const chatParticipantsIds = await this.getAllChatParticipantsIds(
      data.chat.id,
    );

    const onlineChatParticipantsConnectedToChat =
      this.getAllConnectedToChatSocketsFromGivenProfiles(
        data.chat.id,
        chatParticipantsIds,
      );

    const onlineChatParticipantsConnectedToServer =
      this.getAllConnectedToServerSocketsFromGivenProfiles(chatParticipantsIds);

    onlineChatParticipantsConnectedToChat.forEach((connectedToChatSocket) => {
      this.server.to(connectedToChatSocket).emit('currentChatDeleted', {
        ...data.chat,
      });
    });

    onlineChatParticipantsConnectedToServer.forEach(
      (chatParticipantConnectedToServer) => {
        this.server.to(chatParticipantConnectedToServer).emit('chatDeleted', {
          ...data.chat,
        });
      },
    );
  }

  handleDisconnect(socket: Socket) {
    const profileId = this.getProfileIdBySocketId(socket.id);
    if (!profileId) return;

    const chats = this.userChats.get(profileId);
    if (chats) {
      for (const chatId of chats) {
        this.chatUsers.get(chatId)?.delete(profileId);

        //cleaning empty chats
        if (this.chatUsers.get(chatId)?.size === 0) {
          this.chatUsers.delete(chatId);
        }
      }
      this.userChats.delete(profileId);
    }

    this.allConnectedUsers.delete(profileId);

    this.logger.log(
      `User ${profileId} has been disconnected and removed from all chats`,
    );
  }

  private getProfileIdBySocketId(socketId: string): string | undefined {
    for (const [key, value] of this.allConnectedUsers) {
      if (socketId === value) {
        return key;
      }
    }
    return undefined;
  }

  private getSocketIdByProfileId(profileId: string) {
    for (const [value, key] of this.allConnectedUsers) {
      if (value === profileId) return key;
    }
  }

  private async getAllChatParticipantsIds(chatId: string) {
    //getting all chat participants
    const allParticipants =
      await this.chatService.getAllChatParticipants(chatId);

    const allChatParticipantsProfileIds: string[] = [];
    //filling an array with receivers ids
    allParticipants.forEach((receiver) => {
      allChatParticipantsProfileIds.push(receiver.profileId);
    });

    return allChatParticipantsProfileIds;
  }

  private getAllConnectedToChatSocketsFromGivenProfiles(
    chatId: string,
    profilesIds: string[],
  ) {
    const allConnectedToChatSockets: string[] = [];
    for (const profileId of profilesIds) {
      const socketId = this.getSocketIdByProfileId(profileId);
      if (socketId && this.chatUsers.get(chatId)?.has(profileId)) {
        allConnectedToChatSockets.push(socketId);
      }
    }

    return allConnectedToChatSockets;
  }

  private getAllConnectedToServerSocketsFromGivenProfiles(
    profilesIds: string[],
  ) {
    const allConnectedToServerSockets: string[] = [];
    for (const profileId of profilesIds) {
      const socketId = this.getSocketIdByProfileId(profileId);
      if (socketId) allConnectedToServerSockets.push(socketId);
    }
    return allConnectedToServerSockets;
  }

  private createFileFromPayload(file?: {
    buffer: ArrayBuffer;
    originalname: string;
    mimetype: string;
    size: number;
  }): MulterFile {
    let formedFile: MulterFile | undefined;
    if (file) {
      formedFile = {
        buffer: Buffer.from(file.buffer),
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        fieldname: 'file',
        encoding: '7bit',
        destination: '',
        filename: '',
        path: '',
        stream: null,
      } as MulterFile;
    }
    return formedFile;
  }
}
