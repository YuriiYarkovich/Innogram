import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProfileFollow } from '../../common/entities/account/profile-follow.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProfileFollowRepository {
  constructor(
    @InjectRepository(ProfileFollow)
    private profileFollowRepository: Repository<ProfileFollow>,
  ) {}

  async getAllSubscribedOnUsersIds(profileId: string): Promise<string[]> {
    const profileFollows: ProfileFollow[] =
      await this.profileFollowRepository.find({
        where: { follower_profile_id: profileId },
        select: ['followed_profile_id'],
      });

    return profileFollows.map(
      (f: ProfileFollow): string => f.followed_profile_id,
    );
  }
}
