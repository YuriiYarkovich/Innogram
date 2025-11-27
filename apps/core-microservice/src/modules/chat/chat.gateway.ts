import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import {
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
  MessageToDelete,
  MessageToEdit,
  MessageToEmitToEnteredUser,
  ReceivingMessage,
  ReturningMessageData,
} from '../../common/types/message.type';
import { Message } from '../../common/entities/chat/message.entity';
import { ChatParticipant } from '../../common/entities/chat/chat-participant.entity';
import { EditMessageDto } from '../messages/dto/edit-message.dto';
import { Logger } from 'nestjs-pino';
import { MessageReadStatus } from '../../common/enums/message.enum';
import { CreateMessageDto } from '../messages/dto/create-message.dto';
import { MinioService } from '../minio/minio.service';

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

    this.chatUsers.get(data.chatId)?.add(profileId);
  }

  @SubscribeMessage('exitChat')
  handleExitChat(socket: Socket, data: { chatId: string }) {
    const profileId = this.getProfileIdBySocketId(socket.id);

    if (!profileId)
      throw new InternalServerErrorException(
        'Something went wrong while handling exiting to chat',
      );

    this.chatUsers.get(data.chatId)?.delete(profileId);
    //TODO add deleting of the chats from map if there are no connected allConnectedUsers
  }

  @SubscribeMessage(`deleteMessage`)
  async handleDeletingMessage(client: Socket, data: MessageToDelete) {
    const senderProfileId: string = this.findSenderProfileId(client);

    const receiverSocketIds: string[] = await this.getReceiverSocketIds(
      data,
      senderProfileId,
    );

    await this.messagesService.deleteMessage(data.messageId, senderProfileId);
    this.emitDeleteMessageEvent(receiverSocketIds, senderProfileId, data);
  }

  private emitDeleteMessageEvent(
    receiverSocketIds: string[],
    senderProfileId: string,
    messageData: MessageToDelete,
  ) {
    receiverSocketIds.forEach((receiverSocketId: string) => {
      this.server.to(receiverSocketId).emit(
        'deleted',
        JSON.stringify({
          senderProfileId,
          message: messageData.messageId,
        }),
      );
      this.logger.log(
        `Message with id: ${messageData.messageId} has been deleted`,
      );
    });
  }

  private async getReceiverSocketIds(
    data: MessageToEdit | MessageToDelete,
    senderProfileId: string,
  ): Promise<string[]> {
    const receiverSocketIds: string[] = [];

    const receiverProfileIds: string[] = await this.getReceiverProfileIds(
      data,
      senderProfileId,
    );

    receiverProfileIds.forEach((profileId: string) => {
      const socketId: string | undefined =
        this.allConnectedUsers.get(profileId);
      if (socketId) {
        receiverSocketIds.push(socketId);
      }
    });

    return receiverSocketIds;
  }

  /* @SubscribeMessage(`editMessage`)
  async handleEditMessage(client: Socket, data: MessageToEdit) {
    const senderProfileId: string = this.findSenderProfileId(client);

    const receiverSocketIds: string[] = await this.getReceiverSocketIds(
      data,
      senderProfileId,
    );

    const dto: EditMessageDto = {
      content: data.updatedContent,
    };

    const updatedMessage: Message | null =
      await this.messagesService.editMessage(
        data.messageId,
        dto,
        senderProfileId,
        data.files,
      );

    if (!updatedMessage)
      throw new InternalServerErrorException(
        `Something went wrong while updating message`,
      );

    this.emitEditMessageEvent(receiverSocketIds, senderProfileId, data);
  }*/

  private emitEditMessageEvent(
    receiverSocketIds: string[],
    senderProfileId: string,
    messageData: MessageToEdit,
  ) {
    receiverSocketIds.forEach((receiverSocketId: string) => {
      this.server.to(receiverSocketId).emit(
        'edited',
        JSON.stringify({
          senderProfileId,
          message: messageData.updatedContent,
        }),
      );
      this.logger.log(
        `Message with id: ${messageData.messageId} has been edited`,
      );
    });
  }

  @SubscribeMessage(`message`)
  async handleMessage(client: Socket, receivedMessage: ReceivingMessage) {
    const connectedToChatSockets: string[] = [];
    const notConnectedToChatSockets: string[] = [];
    const messageReceivers: MessageReceiver[] = [];

    const allReceivers = await this.chatService.getAllChatParticipants(
      receivedMessage.chatId,
    );
    const allReceiversProfileIds: string[] = [];
    allReceivers.forEach((receiver) => {
      allReceiversProfileIds.push(receiver.profileId);
    });

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
    };
    const createdMessage = await this.messagesService.createMessage(
      dto,
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
      this.server.to(socketId).emit('messageToUserInServer', returningMessage);
    });
  }

  handleDisconnect(socket: Socket) {
    this.allConnectedUsers.forEach((value: string, key: string): void => {
      if (socket.id === value) {
        this.allConnectedUsers.delete(key);
        this.logger.log(
          `User with socketId: ${value} and profileId: ${key} has disconnected!`,
        );
      }
    });
  }

  private getProfileIdBySocketId(socketId: string): string | undefined {
    for (const [key, value] of this.allConnectedUsers) {
      if (socketId === value) {
        return key;
      }
    }
    return undefined;
  }

  private async getReceiverProfileIds(
    data: ReceivingMessage | MessageToEdit | MessageToDelete,
    senderProfileId: string,
  ): Promise<string[]> {
    const chatParticipants: ChatParticipant[] =
      await this.chatService.getAllChatParticipants(data.chatId);

    const receiverProfileIds: string[] = [];

    chatParticipants.forEach((chatParticipant: ChatParticipant) => {
      if (chatParticipant.profileId !== senderProfileId)
        receiverProfileIds.push(chatParticipant.profileId);
    });

    return receiverProfileIds;
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
