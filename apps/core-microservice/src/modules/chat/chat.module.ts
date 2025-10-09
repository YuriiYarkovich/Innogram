import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from '../../common/entities/chatDedicated/chat.entity';
import { ChatParticipant } from '../../common/entities/chatDedicated/chat-participant.entity';
import { ChatRepository } from './repositories/chat.repository';
import { ChatParticipantRepository } from './repositories/chat-participant.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Chat, ChatParticipant])],
  controllers: [ChatController],
  providers: [ChatService, ChatRepository, ChatParticipantRepository],
  exports: [ChatService, ChatRepository, ChatParticipantRepository],
})
export class ChatModule {}
