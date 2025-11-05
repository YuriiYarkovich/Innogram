import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import { context, CONTEXT_KEYS } from '../../common/cls/request-context';
import { Profile } from '../../common/entities/account/profile.entity';
import { ProfilesService } from './profiles.service';
import { ReturningProfileInfo } from '../../common/types/profile.type';

@ApiTags('Operations with profiles')
@ApiBearerAuth('access-token')
@Controller('/api/profiles')
export class ProfilesController {
  constructor(private profilesService: ProfilesService) {}

  @ApiOperation({ summary: 'Return information about current logged profile' })
  @ApiResponse({ status: 200, type: Profile })
  @Get(`/info`)
  @UseGuards(AuthGuard)
  async getProfileInfo(): Promise<ReturningProfileInfo | undefined> {
    const profileId: string = context.get(CONTEXT_KEYS.USER).profileId;
    return await this.profilesService.getProfileInfo(profileId);
  }
}
