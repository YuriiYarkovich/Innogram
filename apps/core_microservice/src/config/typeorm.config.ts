import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
import * as path from 'path';

const env = process.env.NODE_ENV || 'development';
const envFile = `.env.${env}`;

dotenv.config({
  path: path.resolve(__dirname, '../../', envFile),
});

export const createTypeOrmOptions = (
  configService: ConfigService,
): DataSourceOptions => ({
  type: 'postgres',
  host: configService.get<string>('POSTGRES_HOST'),
  port: configService.get<number>('POSTGRES_PORT'),
  username: configService.get<string>('POSTGRES_USER'),
  password: configService.get<string>('POSTGRES_PASSWORD'),
  database: configService.get<string>('POSTGRES_DB'),
  entities: [
    'dist/**/*.entity.js',
    path.join(__dirname, '..', 'common', 'entities', '**', '*.entity.{ts,js}'),
  ],
  migrations: ['dist/common/migrations/*.js'],
  synchronize: false,
  //logging: ['query', 'error', 'schema'],
  logging: ['error'],
});

// For TypeORM CLI
const configService = new ConfigService(process.env);
const dataSource = new DataSource(createTypeOrmOptions(configService));

export default dataSource;
