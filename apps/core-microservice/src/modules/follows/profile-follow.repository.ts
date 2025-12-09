import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProfileFollow } from '../../common/entities/account/profile-follow.entity';
import { Repository } from 'typeorm';
import { FollowAcceptedStatus } from '../../common/enums/profile-follow.enum';
import { FindingSubscriptionRequest } from '../../common/types/profile.type';

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

  async createSubscription(
    currentProfileId: string,
    followingProfileId: string,
    isProfilePublic: boolean,
  ) {
    let profileFollower: ProfileFollow;
    if (isProfilePublic) {
      profileFollower = await this.profileFollowRepository.save({
        follower_profile_id: currentProfileId,
        followed_profile_id: followingProfileId,
        status: FollowAcceptedStatus.ACCEPTED,
      });
    } else {
      profileFollower = await this.profileFollowRepository.save({
        follower_profile_id: currentProfileId,
        followed_profile_id: followingProfileId,
        status: FollowAcceptedStatus.REQUESTED,
      });
    }

    return profileFollower;
  }

  async deleteSubscription(
    currentProfileId: string,
    followingProfileId: string,
  ) {
    return await this.profileFollowRepository.delete({
      follower_profile_id: currentProfileId,
      followed_profile_id: followingProfileId,
    });
  }

  async getAllRequests(currentProfileId: string) {
    return await this.profileFollowRepository.query<
      FindingSubscriptionRequest[]
    >(
      `
        SELECT pf.id,
               pf.status,
               p.id              AS "followerProfileId",
               p.username        AS "followerProfileUsername",
               p.avatar_filename AS "followerProfileAvatarFilename",
               pf.status         AS "subscriptionStatus"
        FROM main.profiles_follows AS pf
               LEFT JOIN main.profiles AS p ON pf.followed_profile_id = p.id
        WHERE pf.followed_profile_id = $1
          AND pf.status = $2
      `,
      [currentProfileId, FollowAcceptedStatus.REQUESTED],
    );
  }
}
