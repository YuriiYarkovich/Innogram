import { InjectRepository } from '@nestjs/typeorm';
import { Profile } from '../../../common/entities/account/profile.entity';
import { In, QueryRunner, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import {
  FindingProfileInfoById,
  FindingProfileInfoByUsername,
} from '../../../common/types/profile.type';
import { EditProfileDto } from '../dto/edit-profile.dto';
import { PostStatus } from '../../../common/enums/post.enum';

@Injectable()
export class ProfilesRepository {
  constructor(
    @InjectRepository(Profile) private profileRepository: Repository<Profile>,
  ) {}

  async foundProfiles(profilesIds: string[]) {
    return await this.profileRepository.find({
      where: {
        id: In(profilesIds),
      },
    });
  }

  async getProfileInfo(
    currentProfileId: string,
    profileId: string,
  ): Promise<FindingProfileInfoById | null> {
    const result: FindingProfileInfoById[] = await this.profileRepository.query(
      `
        SELECT p.username,
               p.birthday,
               p.bio,
               p.avatar_filename                                                         AS "avatarFilename",
               p.is_public                                                               AS "isPublic",
               (SELECT COUNT(*) FROM main.posts WHERE profile_id = p.id AND status = $3) AS "postsAmount",
               (SELECT COUNT(*)
                FROM main.profiles_follows
                WHERE follower_profile_id = p.id)                                        AS "subscriptionsAmount",
               (SELECT COUNT(*)
                FROM main.profiles_follows
                WHERE followed_profile_id = p.id)                                        AS "subscribersAmount",
               (SELECT EXISTS (SELECT 1
                               FROM main.profiles_follows
                               WHERE follower_profile_id = $1
                                 AND followed_profile_id = $2))                          AS "isSubscribed"
        FROM main.profiles AS p
        WHERE p.id = $1
      `,
      [profileId, currentProfileId, PostStatus.ACTIVE],
    );

    return result[0];
  }

  async getProfileInfoByUsername(
    currentProfileId: string,
    username: string,
  ): Promise<FindingProfileInfoByUsername | null> {
    const result: FindingProfileInfoByUsername[] =
      await this.profileRepository.query(
        `
          SELECT p.id,
                 p.birthday,
                 p.bio,
                 p.avatar_filename                                                             AS "avatarFilename",
                 p.is_public                                                                   AS "isPublic",
                 (SELECT COUNT(*) FROM main.posts WHERE profile_id = p.id AND status = $3)     AS "postsAmount",
                 (SELECT COUNT(*) FROM main.profiles_follows WHERE follower_profile_id = p.id) AS "subscriptionsAmount",
                 (SELECT COUNT(*) FROM main.profiles_follows WHERE followed_profile_id = p.id) AS "subscribersAmount",
                 (SELECT EXISTS (SELECT 1
                                 FROM main.profiles_follows
                                 WHERE follower_profile_id = $2
                                   AND followed_profile_id = p.id))                            AS "isSubscribed"
          FROM main.profiles AS p
          WHERE p.username = $1
        `,
        [username, currentProfileId, PostStatus.ACTIVE],
      );

    return result[0];
  }

  async findById(profileId: string) {
    return await this.profileRepository.findOne({ where: { id: profileId } });
  }

  async updateProfile(
    queryRunner: QueryRunner,
    profileId: string,
    dto: EditProfileDto,
    avatarFileName: string | null = null,
  ) {
    if (!avatarFileName) {
      await queryRunner.manager.update(
        Profile,
        { id: profileId },
        {
          username: dto.username,
          bio: dto.bio,
          birthday: dto.birthday,
        },
      );
    } else {
      await queryRunner.manager.update(
        Profile,
        { id: profileId },
        {
          username: dto.username,
          bio: dto.bio,
          birthday: dto.birthday,
          avatarFileName,
        },
      );
    }
  }
}
