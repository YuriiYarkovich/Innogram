import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from '../../common/entities/chat/chat.entity';
import { ChatParticipant } from '../../common/entities/chat/chat-participant.entity';
import { ChatRepository } from './repositories/chat.repository';
import { ChatParticipantRepository } from './repositories/chat-participant.repository';
import { AuthModule } from '../auth/auth.module';
import { ChatGateway } from './chat.gateway';
import { MessagesModule } from '../messages/messages.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chat, ChatParticipant]),
    AuthModule,
    MessagesModule,
  ],
  controllers: [ChatController],
  providers: [
    ChatService,
    ChatRepository,
    ChatParticipantRepository,
    ChatGateway,
  ],
  exports: [ChatService, ChatRepository, ChatParticipantRepository],
})
export class ChatModule {}
