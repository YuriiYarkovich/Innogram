import { BadRequestException, Injectable } from '@nestjs/common';
import { ProfilesRepository } from './repositories/profiles.repository';
import { MinioService } from '../minio/minio.service';
import {
  FindingProfileInfo,
  ReturningProfileInfo,
  ReturningSubscriptionRequest,
} from '../../common/types/profile.type';
import { EditProfileDto } from './dto/edit-profile.dto';
import { File as MulterFile } from 'multer';
import { Profile } from '../../common/entities/account/profile.entity';
import { DataSource, QueryRunner } from 'typeorm';
import { ProfileFollowRepository } from '../follows/profile-follow.repository';
import { FollowAcceptedStatus } from '../../common/enums/profile-follow.enum';

@Injectable()
export class ProfilesService {
  constructor(
    private profilesRepository: ProfilesRepository,
    private profileFollowRepository: ProfileFollowRepository,
    private minioService: MinioService,
    private dataSource: DataSource,
  ) {}

  async getProfileInfo(
    profileId: string,
  ): Promise<ReturningProfileInfo | undefined> {
    const profile: FindingProfileInfo | null =
      await this.profilesRepository.getProfileInfo(profileId, profileId);

    if (!profile)
      throw new BadRequestException('There is no profile with provided ID');

    let avatarUrl: string | undefined = undefined;
    if (profile.avatarFilename) {
      avatarUrl = await this.minioService.getPublicUrl(profile.avatarFilename);
    }

    return {
      ...profile,
      id: profileId,
      avatarUrl,
      isCurrent: true,
    };
  }

  async checkIfProfilesExists(profilesIds: string[]) {
    return await this.profilesRepository.foundProfiles(profilesIds);
  }

  async getProfileInfoByUsername(username: string, currentProfileId: string) {
    const profile: FindingProfileInfo | null =
      await this.profilesRepository.getProfileInfoByUsername(
        currentProfileId,
        username,
      );

    if (!profile)
      throw new BadRequestException(
        'There are no profile with provided username',
      );

    let avatarUrl: string | undefined = undefined;
    if (profile.avatarFilename) {
      avatarUrl = await this.minioService.getPublicUrl(profile.avatarFilename);
    }

    const isCurrent: boolean = currentProfileId === profile.id;
    const returningProfileInfo: ReturningProfileInfo = {
      ...profile,
      username,
      avatarUrl,
      isCurrent,
    };

    return returningProfileInfo;
  }

  async updateProfileInfo(
    dto: EditProfileDto,
    profileId: string,
    file: MulterFile | undefined,
  ): Promise<string> {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const profile: Profile | null =
      await this.profilesRepository.findById(profileId);

    if (!profile)
      throw new BadRequestException(`Profile with this id doesn't exists`);

    let fileData: { hashedFileName: string; type: string } = {
      hashedFileName: '',
      type: '',
    };
    try {
      if (profile.avatarFileName && file.length > 0) {
        await this.minioService.deleteFile(profile.avatarFileName);
      }
      if (file.length > 0) {
        fileData = await this.minioService.uploadFile(file[0]);
      }

      if (fileData.hashedFileName) {
        await this.profilesRepository.updateProfile(
          queryRunner,
          profileId,
          dto,
          fileData.hashedFileName,
        );
      } else {
        await this.profilesRepository.updateProfile(
          queryRunner,
          profileId,
          dto,
        );
      }

      await queryRunner.commitTransaction();

      return JSON.stringify({ message: 'Success!' });
    } catch (e) {
      if (fileData.hashedFileName)
        await this.minioService.deleteFile(fileData.hashedFileName);
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  async followProfile(currentProfileId: string, followingProfileId: string) {
    const profile = await this.getProfileInfo(followingProfileId);
    if (!profile) throw new BadRequestException('This profile does not exist');
    const follow = await this.profileFollowRepository.createSubscription(
      currentProfileId,
      followingProfileId,
      profile?.isPublic,
    );

    return follow;
  }

  async unfollowProfile(
    currentProfileId: string,
    followingProfileId: string,
  ): Promise<{ message: string }> {
    await this.profileFollowRepository.deleteSubscription(
      currentProfileId,
      followingProfileId,
    );
    return { message: 'Success' };
  }

  async getAllSubscriptionsOfProfile(
    profileId: string,
    currentProfileId: string,
  ) {
    const foundProfiles = await this.profilesRepository.getAllSubscriptions(
      profileId,
      currentProfileId,
    );

    const returningProfiles: ReturningProfileInfo[] = [];

    for (const profile of foundProfiles) {
      const returningProfile = await this.createReturningProfileFromFound(
        profile,
        currentProfileId,
      );
      returningProfiles.push(returningProfile);
    }

    return returningProfiles;
  }

  private async createReturningProfileFromFound(
    foundProfile: FindingProfileInfo,
    currentProfileId: string,
  ): Promise<ReturningProfileInfo> {
    let avatarUrl: string | undefined = undefined;
    if (foundProfile.avatarFilename) {
      avatarUrl = await this.minioService.getPublicUrl(
        foundProfile.avatarFilename,
      );
    }

    return {
      ...foundProfile,
      avatarUrl,
      isCurrent: currentProfileId === foundProfile.id,
    };
  }

  async getPossibleChatParticipantsFromSubscriptions(
    excludedIds: string[],
    currentProfileId: string,
  ) {
    const allPossibleChatParticipants =
      await this.profilesRepository.getPossibleChatParticipantsFromSubscriptions(
        excludedIds,
        currentProfileId,
      );

    return allPossibleChatParticipants;
  }

  async getAllSubscribers(profileId: string, currentProfileId: string) {
    const allFoundSubscribers = await this.profilesRepository.getAllSubscribers(
      profileId,
      currentProfileId,
    );

    const returningSubscribers: ReturningProfileInfo[] = [];
    for (const profile of allFoundSubscribers) {
      const returningProfileData = await this.createReturningProfileFromFound(
        profile,
        currentProfileId,
      );
      returningSubscribers.push(returningProfileData);
    }

    return returningSubscribers;
  }

  async deleteSubscriber(
    deletingSubscriberProfileId: string,
    currentProfileId: string,
  ) {
    if (
      await this.profilesRepository.checkIsSubscriberExists(
        currentProfileId,
        deletingSubscriberProfileId,
      )
    ) {
      await this.profilesRepository.deleteSubscriber(
        currentProfileId,
        deletingSubscriberProfileId,
      );
    } else
      throw new BadRequestException('This user is not subscribed on profile');
  }

  async changeVisibilityStatus(currentProfileId: string) {
    const profile = await this.profilesRepository.getProfileInfo(
      currentProfileId,
      currentProfileId,
    );

    if (!profile) throw new BadRequestException('This profile does not exist');

    const newProfile =
      await this.profilesRepository.changeVisibilityStatus(profile);

    const returningProfiledata = await this.createReturningProfileFromFound(
      newProfile,
      currentProfileId,
    );

    return returningProfiledata;
  }

  async getAllSubscriptionsRequests(currentProfileId: string) {
    const profile = await this.getProfileInfo(currentProfileId);
    if (profile && profile?.isPublic)
      throw new BadRequestException(
        'Public profile cannot have follwing requests',
      );

    const foundRequests =
      await this.profileFollowRepository.getAllRequests(currentProfileId);

    const returningRequests: ReturningSubscriptionRequest[] = [];

    for (const request of foundRequests) {
      const avatarUrl = await this.minioService.getPublicUrl(
        request.followerProfileAvatarFilename,
      );

      const returningRequest: ReturningSubscriptionRequest = {
        ...request,
        followerProfileAvatarUrl: avatarUrl,
      };

      returningRequests.push(returningRequest);
    }

    return returningRequests;
  }

  async acceptRequest(subscriptionId: string, currentProfileId: string) {
    const request =
      await this.profileFollowRepository.getSubscriptionById(subscriptionId);
    if (
      !request ||
      request.status === FollowAcceptedStatus.ACCEPTED ||
      request.followed_profile_id !== currentProfileId
    )
      throw new BadRequestException('Subscription request does not exist');

    await this.profileFollowRepository.acceptRequest(subscriptionId);
  }

  async rejectRequest(subscriptionId: string, currentProfileId: string) {
    const request =
      await this.profileFollowRepository.getSubscriptionById(subscriptionId);
    if (
      !request ||
      request.status === FollowAcceptedStatus.ACCEPTED ||
      request.followed_profile_id !== currentProfileId
    )
      throw new BadRequestException('Subscription request does not exist');

    await this.profileFollowRepository.rejectRequest(subscriptionId);
  }

  async getAllSentRequests(currentProfileId: string) {
    const findSentRequests =
      await this.profileFollowRepository.getAllSentRequests(currentProfileId);

    if (!findSentRequests || findSentRequests.length === 0) return [];

    const returningSentRequests: ReturningSubscriptionRequest[] = [];

    for (const findRequest of findSentRequests) {
      const avatarUrl = await this.minioService.getPublicUrl(
        findRequest?.followerProfileAvatarFilename,
      );

      const returningRequest: ReturningSubscriptionRequest = {
        ...findRequest,
        followerProfileAvatarUrl: avatarUrl,
      };

      returningSentRequests.push(returningRequest);
    }

    return returningSentRequests;
  }

  async getTenRandomProfiles(currentProfileId: string) {
    const foundProfiles =
      await this.profilesRepository.returnTenRandomProfiles(currentProfileId);

    if (!foundProfiles) return null;

    const returningProfilesData: ReturningProfileInfo[] = [];

    for (const foundProfile of foundProfiles) {
      const returningProfile = await this.createReturningProfileFromFound(
        foundProfile,
        currentProfileId,
      );

      returningProfilesData.push(returningProfile);
    }

    return returningProfilesData;
  }

  async getSearchResults(username: string, currentProfileId: string) {
    const foundProfiles = await this.profilesRepository.getSearchResults(
      username,
      currentProfileId,
    );

    if (!foundProfiles) return null;

    const returningProfilesData: ReturningProfileInfo[] = [];

    for (const foundProfile of foundProfiles) {
      const returningProfile = await this.createReturningProfileFromFound(
        foundProfile,
        currentProfileId,
      );

      returningProfilesData.push(returningProfile);
    }

    return returningProfilesData;
  }
}
