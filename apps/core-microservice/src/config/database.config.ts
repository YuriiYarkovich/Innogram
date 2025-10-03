import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { User } from '../common/entities/user.entity';
import { Profile } from '../common/entities/profile.entity';
import { Account } from '../common/entities/account.entity';
import { PostAsset } from '../common/entities/post-asset.entity';
import { ProfileFollow } from '../common/entities/profile-follow.entity';
import { Post } from '../common/entities/post.entity';

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
      entities: [User, Profile, Account, Post, PostAsset, ProfileFollow],
      autoLoadEntities: true,
      synchronize: true,
      logging: ['query', 'error', 'schema'],
    };
  }
}
