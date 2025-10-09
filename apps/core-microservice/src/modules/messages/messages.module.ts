import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatParticipant } from '../../common/entities/chatDedicated/chat-participant.entity';
import { Chat } from '../../common/entities/chatDedicated/chat.entity';
import { Message } from '../../common/entities/chatDedicated/message.entity';
import { ChatModule } from '../chat/chat.module';
import { MessagesRepository } from './repositories/messages.repository';
import { MinioModule } from '../minio/minio.module';
import { MessageAssetsRepository } from './repositories/message-assets.repository';
import { MessageAsset } from '../../common/entities/chatDedicated/message_asset.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chat, Message, ChatParticipant, MessageAsset]),
    ChatModule,
    MinioModule,
  ],
  controllers: [MessagesController],
  providers: [MessagesService, MessagesRepository, MessageAssetsRepository],
})
export class MessagesModule {}
