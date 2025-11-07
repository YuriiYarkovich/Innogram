import { InjectRepository } from '@nestjs/typeorm';
import { Profile } from '../../../common/entities/account/profile.entity';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { FindingProfileInfo } from '../../../common/types/profile.type';

@Injectable()
export class ProfilesRepository {
  constructor(
    @InjectRepository(Profile) private profileRepository: Repository<Profile>,
  ) {}

  async getProfileInfo(profileId: string): Promise<FindingProfileInfo | null> {
    const result: FindingProfileInfo[] = await this.profileRepository.query(
      `
        SELECT p.username,
               p.birthday,
               p.bio,
               p.avatar_filename                                                             AS "avatarFilename",
               p.is_public                                                                   AS "isPublic",
               (SELECT COUNT(*) FROM main.posts WHERE profile_id = p.id)                     AS "postsAmount",
               (SELECT COUNT(*) FROM main.profiles_follows WHERE follower_profile_id = p.id) AS "subscriptionsAmount",
               (SELECT COUNT(*) FROM main.profiles_follows WHERE followed_profile_id = p.id) AS "subscribersAmount"
        FROM main.profiles AS p
        WHERE p.id = $1
      `,
      [profileId],
    );

    return result[0];
  }
}
