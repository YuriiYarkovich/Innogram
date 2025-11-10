import { InjectRepository } from '@nestjs/typeorm';
import { Profile } from '../../../common/entities/account/profile.entity';
import { QueryRunner, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { FindingProfileInfo } from '../../../common/types/profile.type';
import { EditProfileDto } from '../dto/edit-profile.dto';

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
