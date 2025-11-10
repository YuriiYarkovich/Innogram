import { BadRequestException, Injectable } from '@nestjs/common';
import { ProfilesRepository } from './repositories/profiles.repository';
import { MinioService } from '../minio/minio.service';
import {
  FindingProfileInfo,
  ReturningProfileInfo,
} from '../../common/types/profile.type';
import { EditProfileDto } from './dto/edit-profile.dto';
import { File as MulterFile } from 'multer';
import { Profile } from '../../common/entities/account/profile.entity';
import { DataSource, QueryRunner } from 'typeorm';
import { configDotenv } from 'dotenv';

@Injectable()
export class ProfilesService {
  constructor(
    private profilesRepository: ProfilesRepository,
    private minioService: MinioService,
    private dataSource: DataSource,
  ) {}

  async getProfileInfo(
    profileId: string,
  ): Promise<ReturningProfileInfo | undefined> {
    const profile: FindingProfileInfo | null =
      await this.profilesRepository.getProfileInfo(profileId);

    if (!profile)
      throw new BadRequestException('There is no profile with provided ID');

    let avatarUrl: string | null = null;
    console.log(`Avatar filename: ${profile.avatarFilename}`);
    if (profile.avatarFilename) {
      avatarUrl = await this.minioService.getPublicUrl(profile.avatarFilename);
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
}
