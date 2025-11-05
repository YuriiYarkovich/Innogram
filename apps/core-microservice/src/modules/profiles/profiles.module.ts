import { Module } from '@nestjs/common';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { ProfilesRepository } from './repositories/profiles.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from '../../common/entities/account/account.entity';
import { MinioModule } from '../minio/minio.module';
import { Profile } from '../../common/entities/account/profile.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Profile, Account]),
    MinioModule,
    AuthModule,
  ],
  controllers: [ProfilesController],
  providers: [ProfilesService, ProfilesRepository],
})
export class ProfilesModule {}
