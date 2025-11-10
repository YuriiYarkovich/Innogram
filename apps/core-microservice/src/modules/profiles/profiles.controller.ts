import {
  Body,
  Controller,
  Get,
  Put,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
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
import { FilesInterceptor } from '@nestjs/platform-express';
import { EditProfileDto } from './dto/edit-profile.dto';
import { File as MulterFile } from 'multer';

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

  @ApiOperation({ summary: 'Updates profile info' })
  @ApiResponse({ status: 200, type: String })
  @Put('/update')
  @UseGuards(AuthGuard)
  @UseInterceptors(FilesInterceptor('file'))
  async updateProfile(
    @Body() dto: EditProfileDto,
    @UploadedFiles() file: MulterFile | undefined,
  ): Promise<string> {
    const profileId: string = context.get(CONTEXT_KEYS.USER).profileId;
    return await this.profilesService.updateProfileInfo(dto, profileId, file);
  }
}
