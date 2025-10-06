import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { User } from '../common/entities/accountDedicated/user.entity';
import { Profile } from '../common/entities/accountDedicated/profile.entity';
import { Account } from '../common/entities/accountDedicated/account.entity';
import { PostAsset } from '../common/entities/postsDedicated/post-asset.entity';
import { ProfileFollow } from '../common/entities/accountDedicated/profile-follow.entity';
import { Post } from '../common/entities/postsDedicated/post.entity';
import { CommentMention } from '../common/entities/commentsDedicated/comment-mention.entity';
import { Comment } from '../common/entities/commentsDedicated/comment.entity';
import { ChatParticipant } from '../common/entities/chatDedicated/chat-participant.entity';
import { Chat } from '../common/entities/chatDedicated/chat.entity';

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
      ],
      autoLoadEntities: true,
      synchronize: true,
      logging: ['query', 'error', 'schema'],
    };
  }
}
