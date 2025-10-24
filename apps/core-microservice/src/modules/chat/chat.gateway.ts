import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Injectable } from '@nestjs/common';
import { MessagesService } from '../messages/messages.service';
import { ChatService } from './chat.service';
import { Server, Socket } from 'socket.io';
import { UserInAccessToken } from '../../common/types/user.type';
import { AuthService } from '../auth/auth.service';
import * as cookie from 'cookie';

@WebSocketGateway(3004, { cors: { origin: '*', credentials: true } })
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly chatService: ChatService,
    private readonly authService: AuthService,
  ) {}

  @WebSocketServer() private server: Server;
  private users: Map<string, string> = new Map<string, string>(); // {socketId; profileId}

  async handleConnection(socket: Socket) {
    try {
      const cookiesHeader: string | undefined = socket.handshake.headers.cookie;
      if (!cookiesHeader) {
        console.log(`No cookies found in handshake! Disconnect`);
        socket.disconnect();
        return;
      }

      const cookies = cookie.parse(cookiesHeader);
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
      throw e;
    }
  }

  private logAllConnectedUsers() {
    console.log(`All connected users: `);
    this.users.forEach((value, key) => {
      console.log(`profileId: ${key}, socketId: ${value}`);
    });
  }

  handleDisconnect(socket: Socket) {
    console.log(`In handle disconnect method`);

    this.users.forEach((value, key) => {
      if (socket.id === value) {
        this.users.delete(key);
        console.log(
          `User with socketId: ${value} and profileId: ${key} has disconnected!`,
        );
      }
    });
    this.logAllConnectedUsers();
  }
}
