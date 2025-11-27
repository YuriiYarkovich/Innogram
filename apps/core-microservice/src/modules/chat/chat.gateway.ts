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
  MessageReceiverStatus,
  MessageToDelete,
  MessageToEdit,
  ReceivingMessage,
  MessageToEmitToEnteredUser,
} from '../../common/types/message.type';
import { CreateMessageDto } from '../messages/dto/create-message.dto';
import { Message } from '../../common/entities/chat/message.entity';
import { ChatParticipant } from '../../common/entities/chat/chat-participant.entity';
import { EditMessageDto } from '../messages/dto/edit-message.dto';
import { Logger } from 'nestjs-pino';

@WebSocketGateway(3004, { cors: { origin: '*', credentials: true } })
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly chatService: ChatService,
    private readonly authService: AuthService,
    private readonly logger: Logger,
  ) {}

  @WebSocketServer() private server: Server;
  private users: Map<string, string> = new Map<string, string>(); // {profileId; socketId}

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

      this.users.set(profileId, socket.id);
      this.logger.log(
        `Client connected! ProfileId(key): ${user.profileId}, socketId:${socket.id}`,
      );

      const messagesToEmit: MessageToEmitToEnteredUser[] =
        await this.messagesService.getAllUnreadMessagesOfProfile(profileId);
      if (messagesToEmit.length > 0)
        await this.emitMessagesToNewUser(messagesToEmit);
    } catch (e) {
      socket.disconnect();
      if (e instanceof HttpException || e.message === `Access token expired!`)
        throw new UnauthorizedException(`Access token expired!`);
      throw e;
    }
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
      const socketId: string | undefined = this.users.get(profileId);
      if (socketId) {
        receiverSocketIds.push(socketId);
      }
    });

    return receiverSocketIds;
  }

  @SubscribeMessage(`editMessage`)
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
  }

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
    const receiverSocketIds: string[] = [];
    const onlineReceiversIds: string[] = [];
    const notOnlineReceiversIds: string[] = [];
    console.log(1);
    const receiverProfileIds: string[] = await this.getReceiverProfileIds(
      receivedMessage,
      receivedMessage.senderId,
    );
    console.log(2);
    receiverProfileIds.forEach((profileId: string) => {
      const socketId: string | undefined = this.users.get(profileId);
      if (socketId) {
        receiverSocketIds.push(socketId);
        onlineReceiversIds.push(profileId);
      } else {
        notOnlineReceiversIds.push(profileId);
      }
    });
    console.log(3);
    console.log(`Received message: ${JSON.stringify(receivedMessage)}`);
    const dto: CreateMessageDto = {
      chatId: receivedMessage.chatId,
      content: receivedMessage.content,
      senderId: receivedMessage.senderId,
    };

    const receiverProfiles: MessageReceiverStatus[] = [];
    console.log(4);
    for (const onlineReceiverId of onlineReceiversIds) {
      receiverProfiles.push({
        receiverId: onlineReceiverId,
        readStatus: true,
      });
    }
    console.log(5);
    for (const notOnlineReceiverId of notOnlineReceiversIds) {
      receiverProfiles.push({
        receiverId: notOnlineReceiverId,
        readStatus: false,
      });
    }
    console.log(6);
    const createdMessage: Message = await this.messagesService.createMessage(
      dto,
      receiverProfiles,
      receivedMessage.files,
    );
    console.log(7);
    if (receiverSocketIds.length > 0) {
      this.emitMessage(
        receiverSocketIds,
        receivedMessage.senderId,
        receivedMessage,
      );
    }
  }

  private emitMessage(
    receiverSocketIds: string[],
    senderProfileId: string,
    messageData: ReceivingMessage,
  ) {
    receiverSocketIds.forEach((receiverSocketId: string) => {
      this.server
        .to(receiverSocketId)
        .emit(
          'reply',
          JSON.stringify({ senderProfileId, message: messageData.content }),
        );
      this.logger.log(
        `Message sent to user with socket id: ${receiverSocketId}: ${messageData.content}; to chat: ${messageData.chatId}`, //TODO delete this log after everything will work fine
      );
    });
  }

  private async emitMessagesToNewUser(messages: MessageToEmitToEnteredUser[]) {
    for (const message of messages) {
      this.server.emit('reply', JSON.stringify(message));
    }
    await this.messagesService.updateReadStatusOfMessages(messages);
  }

  handleDisconnect(socket: Socket) {
    this.users.forEach((value: string, key: string): void => {
      if (socket.id === value) {
        this.users.delete(key);
        this.logger.log(
          `User with socketId: ${value} and profileId: ${key} has disconnected!`,
        );
      }
    });
  }

  private getProfileIdBySocketId(socketId: string): string | undefined {
    for (const [key, value] of this.users) {
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
}
