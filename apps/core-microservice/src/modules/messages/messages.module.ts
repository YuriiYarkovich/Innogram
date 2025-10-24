import { forwardRef, Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatParticipant } from '../../common/entities/chat/chat-participant.entity';
import { Chat } from '../../common/entities/chat/chat.entity';
import { Message } from '../../common/entities/chat/message.entity';
import { ChatModule } from '../chat/chat.module';
import { MessagesRepository } from './repositories/messages.repository';
import { MinioModule } from '../minio/minio.module';
import { MessageAssetsRepository } from './repositories/message-assets.repository';
import { MessageAsset } from '../../common/entities/chat/message_asset.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chat, Message, ChatParticipant, MessageAsset]),
    forwardRef(() => ChatModule),
    MinioModule,
    AuthModule,
  ],
  controllers: [MessagesController],
  providers: [MessagesService, MessagesRepository, MessageAssetsRepository],
  exports: [MessagesService],
})
export class MessagesModule {}
