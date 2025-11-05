import { InjectRepository } from '@nestjs/typeorm';
import { Profile } from '../../../common/entities/account/profile.entity';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ProfilesRepository {
  constructor(
    @InjectRepository(Profile) private profileRepository: Repository<Profile>,
  ) {}

  async getProfileInfo(profileId: string): Promise<Profile | null> {
    return await this.profileRepository.findOne({ where: { id: profileId } });
  }
}
