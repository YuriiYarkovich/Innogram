import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { DatabaseConfig } from './config/database.config';
import { PostsModule } from './modules/posts/posts.module';
import { MinioModule } from './modules/minio/minio.module';
import { CommentsModule } from './modules/comments/comments.module';
import { ChatModule } from './modules/chat/chat.module';
import { MessagesModule } from './modules/messages/messages.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProfilesModule } from './modules/profiles/profiles.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        join(__dirname, '..', '..', '..', '.env'), // абсолютный путь до корня
        join(__dirname, '.env.local'),
      ],
    }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfig,
    }),
    PostsModule,
    MinioModule,
    CommentsModule,
    ChatModule,
    MessagesModule,
    AuthModule,
    ProfilesModule,
  ],
})
export class AppModule {}
