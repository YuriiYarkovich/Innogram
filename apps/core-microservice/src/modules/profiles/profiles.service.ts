import { BadRequestException, Injectable } from '@nestjs/common';
import { ProfilesRepository } from './repositories/profiles.repository';
import { Profile } from '../../common/entities/account/profile.entity';
import { MinioService } from '../minio/minio.service';
import { ReturningProfileInfo } from '../../common/types/profile.type';

@Injectable()
export class ProfilesService {
  constructor(
    private profilesRepository: ProfilesRepository,
    private minioService: MinioService,
  ) {}

  async getProfileInfo(
    profileId: string,
  ): Promise<ReturningProfileInfo | undefined> {
    const profile: Profile | null =
      await this.profilesRepository.getProfileInfo(profileId);

    if (!profile)
      throw new BadRequestException('There is no profile with provided ID');

    const avatarUrl: string | null = await this.minioService.getPublicUrl(
      profile.avatarFileName,
    );

    let returningProfileInfo: ReturningProfileInfo;
    if (avatarUrl) {
      returningProfileInfo = {
        profileId: profile.id,
        username: profile.username,
        birthday: profile.birthday.toString(),
        bio: profile.bio,
        avatarUrl,
        isPublic: profile.isPublic,
      };
    } else {
      returningProfileInfo = {
        profileId: profile.id,
        username: profile.username,
        birthday: profile.birthday.toString(),
        bio: profile.bio,
        isPublic: profile.isPublic,
      };

      return returningProfileInfo;
    }
  }
}
