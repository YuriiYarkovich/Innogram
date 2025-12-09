import { InjectRepository } from '@nestjs/typeorm';
import { Profile } from '../../../common/entities/account/profile.entity';
import { In, QueryRunner, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { FindingProfileInfo } from '../../../common/types/profile.type';
import { EditProfileDto } from '../dto/edit-profile.dto';
import { PostStatus } from '../../../common/enums/post.enum';
import { ProfileFollow } from '../../../common/entities/account/profile-follow.entity';
import { FollowAcceptedStatus } from '../../../common/enums/profile-follow.enum';

@Injectable()
export class ProfilesRepository {
  constructor(
    @InjectRepository(Profile) private profileRepository: Repository<Profile>,
    @InjectRepository(ProfileFollow)
    private profileFollowRepository: Repository<ProfileFollow>,
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
  ): Promise<FindingProfileInfo | null> {
    const result: FindingProfileInfo[] = await this.profileRepository.query(
      `
        SELECT p.id,
               p.username,
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
                               WHERE follower_profile_id = $2
                                 AND followed_profile_id = p.id
                                 AND status = $4))                                       AS "isSubscribed"
        FROM main.profiles AS p
        WHERE p.id = $1
      `,
      [
        profileId,
        currentProfileId,
        PostStatus.ACTIVE,
        FollowAcceptedStatus.ACCEPTED,
      ],
    );

    return result[0];
  }

  async getProfileInfoByUsername(
    currentProfileId: string,
    username: string,
  ): Promise<FindingProfileInfo | null> {
    const result: FindingProfileInfo[] = await this.profileRepository.query(
      `
        SELECT p.id,
               p.username,
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
                                 AND followed_profile_id = p.id
                                 AND status = $4))                                           AS "isSubscribed",
               (SELECT status
                FROM main.profiles_follows
                WHERE follower_profile_id = $2
                  AND followed_profile_id = p.id
                LIMIT 1)                                                                     AS "subscribedStatus"
        FROM main.profiles AS p
        WHERE p.username = $1
      `,
      [
        username,
        currentProfileId,
        PostStatus.ACTIVE,
        FollowAcceptedStatus.ACCEPTED,
      ],
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

  async getAllSubscriptions(profileId: string, currentProfileId: string) {
    return await this.profileRepository.query<FindingProfileInfo[]>(
      `
        SELECT p.id,
               p.birthday,
               p.username,
               p.bio,
               p.avatar_filename                                                             AS "avatarFilename",
               p.is_public                                                                   AS "isPublic",
               (SELECT COUNT(*) FROM main.posts WHERE profile_id = p.id AND status = $3)     AS "postsAmount",
               (SELECT COUNT(*) FROM main.profiles_follows WHERE follower_profile_id = p.id) AS "subscriptionsAmount",
               (SELECT COUNT(*) FROM main.profiles_follows WHERE followed_profile_id = p.id) AS "subscribersAmount",
               (SELECT EXISTS (SELECT 1
                               FROM main.profiles_follows
                               WHERE follower_profile_id = $2
                                 AND followed_profile_id = p.id
                                 AND status = $4))                                           AS "isSubscribed",
               (SELECT status
                FROM main.profiles_follows
                WHERE follower_profile_id = $2
                  AND followed_profile_id = p.id
                LIMIT 1)                                                                     AS "subscribedStatus"
        FROM main.profiles_follows AS prf
               INNER JOIN main.profiles p on prf.followed_profile_id = p.id
        WHERE prf.follower_profile_id = $1
      `,
      [
        profileId,
        currentProfileId,
        PostStatus.ACTIVE,
        FollowAcceptedStatus.ACCEPTED,
      ],
    );
  }

  async getPossibleChatParticipantsFromSubscriptions(
    excludedProfilesIds: string[],
    currentProfileId: string,
  ) {
    return await this.profileRepository.query<FindingProfileInfo[]>(
      `
        SELECT p.id,
               p.birthday,
               p.username,
               p.bio,
               p.avatar_filename                                                             AS "avatarFilename",
               p.is_public                                                                   AS "isPublic",
               (SELECT COUNT(*) FROM main.posts WHERE profile_id = p.id AND status = $3)     AS "postsAmount",
               (SELECT COUNT(*) FROM main.profiles_follows WHERE follower_profile_id = p.id) AS "subscriptionsAmount",
               (SELECT COUNT(*) FROM main.profiles_follows WHERE followed_profile_id = p.id) AS "subscribersAmount",
               (SELECT EXISTS (SELECT 1
                               FROM main.profiles_follows
                               WHERE follower_profile_id = $2
                                 AND followed_profile_id = p.id
                                 AND status = $4))                                           AS "isSubscribed",
               (SELECT status
                FROM main.profiles_follows
                WHERE follower_profile_id = $2
                  AND followed_profile_id = p.id
                LIMIT 1)                                                                     AS "subscribedStatus"
        FROM main.profiles_follows AS prf
               INNER JOIN main.profiles p on prf.followed_profile_id = p.id
        WHERE prf.follower_profile_id = $2
          AND p.id != ALL ($1)
      `,
      [
        excludedProfilesIds,
        currentProfileId,
        PostStatus.ACTIVE,
        FollowAcceptedStatus.ACCEPTED,
      ],
    );
  }

  async getAllSubscribers(profileId: string, currentProfileId: string) {
    return await this.profileRepository.query<FindingProfileInfo[]>(
      `
        SELECT p.id,
               p.birthday,
               p.username,
               p.bio,
               p.avatar_filename                                                             AS "avatarFilename",
               p.is_public                                                                   AS "isPublic",
               (SELECT COUNT(*) FROM main.posts WHERE profile_id = p.id AND status = $3)     AS "postsAmount",
               (SELECT COUNT(*) FROM main.profiles_follows WHERE follower_profile_id = p.id) AS "subscriptionsAmount",
               (SELECT COUNT(*) FROM main.profiles_follows WHERE followed_profile_id = p.id) AS "subscribersAmount",
               (SELECT EXISTS (SELECT 1
                               FROM main.profiles_follows
                               WHERE follower_profile_id = $2
                                 AND followed_profile_id = p.id
                                 AND status = $4))                                           AS "subscribeStatus",
               (SELECT status
                FROM main.profiles_follows
                WHERE follower_profile_id = $2
                  AND followed_profile_id = p.id
                LIMIT 1)                                                                     AS "subscribedStatus"
        FROM main.profiles_follows AS prf
               INNER JOIN main.profiles p on prf.follower_profile_id = p.id
        WHERE prf.followed_profile_id = $1
      `,
      [
        profileId,
        currentProfileId,
        PostStatus.ACTIVE,
        FollowAcceptedStatus.ACCEPTED,
      ],
    );
  }

  async checkIsSubscriberExists(
    currentProfileId: string,
    subscriberProfileId: string,
  ) {
    const subscriber = await this.profileFollowRepository.findOne({
      where: {
        followed_profile_id: currentProfileId,
        follower_profile_id: subscriberProfileId,
      },
    });

    return !!subscriber;
  }

  async deleteSubscriber(currentProfileId: string, subscriberId: string) {
    await this.profileFollowRepository.delete({
      followed_profile_id: currentProfileId,
      follower_profile_id: subscriberId,
    });
  }

  async changeVisibilityStatus(profile: FindingProfileInfo) {
    if (profile.isPublic) {
      await this.profileRepository.update(
        { id: profile.id },
        { isPublic: false },
      );
      profile.isPublic = false;
    } else {
      await this.profileRepository.update(
        { id: profile.id },
        { isPublic: false },
      );
      profile.isPublic = true;
    }
    return profile;
  }
}
