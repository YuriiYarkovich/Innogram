import {
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
import { Logger } from 'nestjs-pino';
import { MessageReadStatus } from '../../common/enums/message.enum';
import { CreateMessageDto } from '../messages/dto/create-message.dto';
import { MinioService } from '../minio/minio.service';
import { CreateChatDto } from './dto/create-chat.dto';

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
        console.log(`No cookies found in handshake! Disconnect`);
        socket.disconnect();
        return;
      }

      const cookies: Record<string, string | undefined> =
        cookie.parse(cookiesHeader);
      const accessToken: string | undefined = cookies['accessToken'];

      if (!accessToken) {
        console.log(`No access token provided! Disconnect`);
        socket.disconnect();
        return;
      }
      const user: UserInAccessToken =
        await this.authService.validateAccessToken(accessToken);
      const profileId: string = user.profileId;

      this.allConnectedUsers.set(profileId, socket.id);
      console.log(
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

    this.chatUsers.get(data.chatId)?.delete(profileId);
    this.userChats.get(profileId)?.delete(data.chatId);
  }

  @SubscribeMessage(`message`)
  async handleMessage(client: Socket, receivedMessage: ReceivingMessage) {
    console.log(`RECEIVED MESSAGE: ${JSON.stringify(receivedMessage)}`);
    const connectedToChatSockets: string[] = [];
    const notConnectedToChatSockets: string[] = [];
    const messageReceivers: MessageReceiver[] = [];

    const allReceiversProfileIds: string[] = [];
    //in next block -- finding chat id
    if (!receivedMessage.receiverId && receivedMessage.chatId) {
      //getting all chat participants
      const allReceivers = await this.chatService.getAllChatParticipants(
        receivedMessage.chatId,
      );

      //filling an array with receivers ids
      allReceivers.forEach((receiver) => {
        allReceiversProfileIds.push(receiver.profileId);
      });
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
    console.log(`Message receivers: ${JSON.stringify(messageReceivers)}`);
    const createdMessage = await this.messagesService.createMessage(
      dto,
      receivedMessage.senderId,
      messageReceivers,
      receivedMessage.files,
    );

    const authorAvatarUrl = await this.minioService.getPublicUrl(
      createdMessage.authorAvatarFilename,
    );
    const returningMessage: ReturningMessageData = {
      ...createdMessage,
      authorAvatarUrl,
    };

    connectedToChatSockets.forEach((socketId) => {
      this.server.to(socketId).emit('messageToUserInChat', returningMessage);
    });

    notConnectedToChatSockets.forEach((socketId) => {
      if (returningMessage.read === MessageReadStatus.READ)
        returningMessage.read = MessageReadStatus.UNREAD;
      this.server.to(socketId).emit('messageToUserInServer', returningMessage);
    });
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

    console.log(
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

  private findSenderProfileId(client: Socket): string {
    const senderProfileId: string | undefined = this.getProfileIdBySocketId(
      client.id,
    );

    if (!senderProfileId)
      throw new InternalServerErrorException(
        `Client id is not in connected users list!`,
      );

    return senderProfileId;
  }

  private getSocketIdByProfileId(profileId: string) {
    for (const [value, key] of this.allConnectedUsers) {
      if (value === profileId) return key;
    }
  }
}
