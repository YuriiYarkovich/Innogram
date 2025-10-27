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
import type { MessageToEmit } from '../../common/types/message.type';

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

  @SubscribeMessage(`message`)
  async handleMessage(client: Socket, data: MessageToEmit) {
    const receiverSocketIds: string[] = [];

    this.users.forEach((value: string, key: string): void => {
      data.receiverProfileIds.forEach((profileId: string) => {
        if (key === profileId) {
          receiverSocketIds.push(value);
        }
      });
    });

    if (receiverSocketIds.length > 0) {
      //TODO save to db with read status
      const senderProfileId: string | undefined = this.getProfileIdBySocketId(
        client.id,
      );

      if (!senderProfileId)
        throw new InternalServerErrorException(
          `Client id is not in connected users list!`,
        );

      this.emitMessage(receiverSocketIds, senderProfileId, data);
    } else {
      //TODO save message to db with unread status
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
          JSON.stringify({ senderProfileId, message: messageData.message }),
        );
      console.log(
        `Message sent to user with socket id: ${receiverSocketId}: ${messageData.message}`,
      );
    });
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
}
