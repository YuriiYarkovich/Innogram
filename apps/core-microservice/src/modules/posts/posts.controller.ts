import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
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
    const profileId = '27b439b8-9bbc-4425-9690-8ecc73dcbc49'; //TODO get from CLS when auth module ready
    return await this.postsService.createPost(profileId, content, files);
  }

  @Get('/getByProfile/:profileId')
  async getByAccount(@Param('profileId') profileId: string) {
    return await this.postsService.getByProfile(profileId);
  }

  @Put('/editPost/:postId')
  @UseInterceptors(FilesInterceptor('files'))
  async editPost(
    @Param('postId') postId: string,
    @Body('content') content: string,
    @UploadedFiles() files,
  ) {
    const profileId = '27b439b8-9bbc-4425-9690-8ecc73dcbc49'; //TODO get from CLS when auth module ready
    return await this.postsService.updatePost(
      postId,
      profileId,
      content,
      files,
    );
  }

  @Delete('/delete/:postId')
  async deletePost(@Param('postId') postId: string) {
    const profileId = '27b439b8-9bbc-4425-9690-8ecc73dcbc49'; //TODO get from CLS when auth module ready
    return await this.postsService.deletePost(postId, profileId);
  }

  @Post('like/:postId')
  async likePost(@Param('postId') postId: string) {
    const profileId = '27b439b8-9bbc-4425-9690-8ecc73dcbc49'; //TODO get from CLS when auth module ready
    return this.postsService.addLike(postId, profileId);
  }

  @Delete('unlike/:postId')
  async unlikePost(@Param('postId') postId: string) {
    const profileId = '27b439b8-9bbc-4425-9690-8ecc73dcbc49'; //TODO get from CLS when auth module ready
    return this.postsService.removeLike(postId, profileId);
  }

  @Get('/allLikes/:postId')
  async getAllLikes(@Param('postId') postId: string) {
    return this.postsService.getAllLikesOfPost(postId);
  }
}
