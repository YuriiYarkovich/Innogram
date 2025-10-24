import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { User } from '../common/entities/account/user.entity';
import { Profile } from '../common/entities/account/profile.entity';
import { Account } from '../common/entities/account/account.entity';
import { PostAsset } from '../common/entities/posts/post-asset.entity';
import { ProfileFollow } from '../common/entities/account/profile-follow.entity';
import { Post } from '../common/entities/posts/post.entity';
import { CommentMention } from '../common/entities/comments/comment-mention.entity';
import { Comment } from '../common/entities/comments/comment.entity';
import { ChatParticipant } from '../common/entities/chat/chat-participant.entity';
import { Chat } from '../common/entities/chat/chat.entity';
import { MessageAsset } from '../common/entities/chat/message_asset.entity';
import { Message } from '../common/entities/chat/message.entity';
import { PostLike } from '../common/entities/posts/post-like.entity';
import { CommentLike } from '../common/entities/comments/comment-like.entity';

@Injectable()
export class DatabaseConfig implements TypeOrmOptionsFactory {
  constructor(private readonly config: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.config.get<string>('POSTGRES_HOST'),
      port: this.config.get<number>('POSTGRES_PORT'),
      username: this.config.get<string>('POSTGRES_USER'),
      password: this.config.get<string>('POSTGRES_PASSWORD'),
      database: this.config.get<string>('POSTGRES_DB'),
      entities: [
        User,
        Profile,
        Account,
        Post,
        PostAsset,
        ProfileFollow,
        Comment,
        CommentMention,
        Chat,
        ChatParticipant,
        Message,
        MessageAsset,
        PostLike,
        CommentLike,
      ],
      autoLoadEntities: true,
      synchronize: true,
      logging: ['query', 'error', 'schema'],
    };
  }
}
