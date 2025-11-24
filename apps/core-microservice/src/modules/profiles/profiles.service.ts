import { BadRequestException, Injectable } from '@nestjs/common';
import { ProfilesRepository } from './repositories/profiles.repository';
import { MinioService } from '../minio/minio.service';
import {
  FindingProfileInfoById,
  FindingProfileInfoByUsername,
  ReturningProfileInfo,
} from '../../common/types/profile.type';
import { EditProfileDto } from './dto/edit-profile.dto';
import { File as MulterFile } from 'multer';
import { Profile } from '../../common/entities/account/profile.entity';
import { DataSource, QueryRunner } from 'typeorm';
import { ProfileFollowRepository } from '../follows/profile-follow.repository';

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
    const profile: FindingProfileInfoById | null =
      await this.profilesRepository.getProfileInfo(profileId, profileId);

    if (!profile)
      throw new BadRequestException('There is no profile with provided ID');

    let avatarUrl: string | undefined = undefined;
    if (profile.avatarFilename) {
      avatarUrl = await this.minioService.getPublicUrl(profile.avatarFilename);
    }

    return {
      ...profile,
      profileId,
      avatarUrl,
      isCurrent: true,
    };
  }

  async getProfileInfoByUsername(username: string, currentProfileId: string) {
    const profile: FindingProfileInfoByUsername | null =
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

    const isCurrent: boolean = currentProfileId === profile.profileId;
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

  async followProfile(
    currentProfileId: string,
    followingProfileId: string,
  ): Promise<{ message: string }> {
    await this.profileFollowRepository.createSubscription(
      currentProfileId,
      followingProfileId,
    );

    return { message: 'Success' };
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
}
