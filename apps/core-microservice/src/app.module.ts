import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { DatabaseConfig } from './config/database.config';

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
  ],
})
export class AppModule {}
