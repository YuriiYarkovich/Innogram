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
import { LoggerModule } from 'nestjs-pino';

const getEnvFilePath = () => {
  const env = process.env.NODE_ENV || 'development';
  return join(__dirname, '..', '..', '..', `.env.${env}`);
};

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: getEnvFilePath(),
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

    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss.l',
            ignore: 'pid,hostname,req,res,context,responseTime',
            messageFormat:
              '{req.method} {req.url} → {res.statusCode} ({responseTime}ms)',
          },
        },
      },
    }),
  ],
})
export class AppModule {}
