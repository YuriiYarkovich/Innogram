import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('api/posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Post('/create')
  @UseInterceptors(FilesInterceptor('files'))
  async createPost(@Body('content') content: string, @UploadedFiles() files) {
    console.log(`content in controller: ${content}`);
    //console.log(`Files in controller: ${JSON.stringify(files)}`);
    const profile_id = '27b439b8-9bbc-4425-9690-8ecc73dcbc49'; //TODO remove when auth module ready
    return await this.postsService.createPost(profile_id, content, files);
  }

  @Get('/getByProfile/:profileId')
  async getByAccount(@Param('profileId') profileId: string) {
    return await this.postsService.getByProfile(profileId);
  }
}
