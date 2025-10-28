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
  MessageToEmit,
  MessageToEmitToEnteredUser,
} from '../../common/types/message.type';
import { CreateMessageDto } from '../messages/dto/create-message.dto';
import { Message } from '../../common/entities/chat/message.entity';
import { ChatParticipant } from '../../common/entities/chat/chat-participant.entity';
import { EditMessageDto } from '../messages/dto/edit-message.dto';

@WebSocketGateway(3004, { cors: { origin: '*', credentials: true } })
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly chatService: ChatService,
    private readonly authService: AuthService,
  ) {}

  @WebSocketServer() private server: Server;
  private users: Map<string, string> = new Map<string, string>(); // {profileId; socketId}

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

      this.users.set(profileId, socket.id);

      console.log(
        `Client connected! ProfileId(key): ${user.profileId}, socketId:${socket.id}`,
      );

      const messagesToEmit: MessageToEmitToEnteredUser[] =
        await this.messagesService.getAllUnreadMessagesOfProfile(profileId);

      if (messagesToEmit.length > 0)
        await this.emitMessagesToNewUser(messagesToEmit);

      this.logAllConnectedUsers();
    } catch (e) {
      socket.disconnect();
      if (e instanceof HttpException || e.message === `Access token expired!`)
        throw new UnauthorizedException(`Access token expired!`);
      throw e;
    }
  }

  private logAllConnectedUsers(): void {
    console.log(`All connected users: `);
    this.users.forEach((value: string, key: string): void => {
      console.log(`profileId: ${key}, socketId: ${value}`);
    });
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
      console.log(`Message with id: ${messageData.messageId} has been deleted`);
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
      console.log(`Message with id: ${messageData.messageId} has been edited`);
    });
  }

  @SubscribeMessage(`message`)
  async handleMessage(client: Socket, data: MessageToEmit) {
    const receiverSocketIds: string[] = [];
    const onlineReceiversIds: string[] = [];
    const notOnlineReceiversIds: string[] = [];

    const senderProfileId: string = this.findSenderProfileId(client);

    const receiverProfileIds: string[] = await this.getReceiverProfileIds(
      data,
      senderProfileId,
    );

    receiverProfileIds.forEach((profileId: string) => {
      const socketId: string | undefined = this.users.get(profileId);
      if (socketId) {
        receiverSocketIds.push(socketId);
        onlineReceiversIds.push(profileId);
      } else {
        notOnlineReceiversIds.push(profileId);
      }
    });

    const dto: CreateMessageDto = {
      chatId: data.chatId,
      content: data.content,
      senderId: senderProfileId,
    };

    const receiverProfiles: MessageReceiverStatus[] = [];

    for (const onlineReceiverId of onlineReceiversIds) {
      receiverProfiles.push({
        receiverId: onlineReceiverId,
        readStatus: true,
      });
    }

    for (const notOnlineReceiverId of notOnlineReceiversIds) {
      receiverProfiles.push({
        receiverId: notOnlineReceiverId,
        readStatus: false,
      });
    }

    const createdMessage: Message = await this.messagesService.createMessage(
      dto,
      receiverProfiles,
      data.files,
    );

    if (receiverSocketIds.length > 0) {
      data.messageId = createdMessage.id;
      this.emitMessage(receiverSocketIds, senderProfileId, data);
    }
  }

  private emitMessage(
    receiverSocketIds: string[],
    senderProfileId: string,
    messageData: MessageToEmit,
  ) {
    receiverSocketIds.forEach((receiverSocketId: string) => {
      this.server
        .to(receiverSocketId)
        .emit(
          'reply',
          JSON.stringify({ senderProfileId, message: messageData.content }),
        );
      console.log(
        `Message sent to user with socket id: ${receiverSocketId}: ${messageData.content}; to chat: ${messageData.chatId}`,
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
        console.log(
          `User with socketId: ${value} and profileId: ${key} has disconnected!`,
        );
      }
    });
    this.logAllConnectedUsers();
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
    data: MessageToEmit | MessageToEdit | MessageToDelete,
    senderProfileId: string,
  ): Promise<string[]> {
    const chatParticipants: ChatParticipant[] =
      await this.chatService.getAllChatParticipants(data.chatId);

    const receiverProfileIds: string[] = [];

    chatParticipants.forEach((chatParticipant: ChatParticipant) => {
      if (chatParticipant.profile_id !== senderProfileId)
        receiverProfileIds.push(chatParticipant.profile_id);
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
