import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileFollowRepository } from './profile-follow.repository';
import { ProfileFollow } from '../../common/entities/account/profile-follow.entity';

@Module({
  providers: [ProfileFollowRepository],
  imports: [TypeOrmModule.forFeature([ProfileFollow])],
  exports: [ProfileFollowRepository],
})
export class FollowsModule {}
