import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

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
      autoLoadEntities: true,
      synchronize: true,
    };
  }
}
