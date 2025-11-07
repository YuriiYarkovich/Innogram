import { BadRequestException, Injectable } from '@nestjs/common';
import { ProfilesRepository } from './repositories/profiles.repository';
import { MinioService } from '../minio/minio.service';
import {
  FindingProfileInfo,
  ReturningProfileInfo,
} from '../../common/types/profile.type';

@Injectable()
export class ProfilesService {
  constructor(
    private profilesRepository: ProfilesRepository,
    private minioService: MinioService,
  ) {}

  async getProfileInfo(
    profileId: string,
  ): Promise<ReturningProfileInfo | undefined> {
    const profile: FindingProfileInfo | null =
      await this.profilesRepository.getProfileInfo(profileId);

    if (!profile)
      throw new BadRequestException('There is no profile with provided ID');

    let avatarUrl: string | null = null;
    if (profile.avatarFileName) {
      avatarUrl = await this.minioService.getPublicUrl(profile.avatarFileName);
    }

    let returningProfileInfo: ReturningProfileInfo;
    if (avatarUrl) {
      returningProfileInfo = {
        profileId,
        username: profile.username,
        birthday: profile.birthday,
        bio: profile.bio,
        avatarUrl,
        isPublic: profile.isPublic,
        postsAmount: profile.postsAmount,
        subscribersAmount: profile.subscribersAmount,
        subscriptionsAmount: profile.subscriptionsAmount,
      };
    } else {
      returningProfileInfo = {
        profileId,
        username: profile.username,
        birthday: profile.birthday,
        bio: profile.bio,
        isPublic: profile.isPublic,
        postsAmount: profile.postsAmount,
        subscribersAmount: profile.subscribersAmount,
        subscriptionsAmount: profile.subscriptionsAmount,
      };
    }

    return returningProfileInfo;
  }
}
