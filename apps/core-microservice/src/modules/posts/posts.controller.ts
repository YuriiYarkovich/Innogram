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
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PostLike } from '../../common/entities/posts/post-like.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { context, CONTEXT_KEYS } from '../../common/cls/request-context';
import { PostsRepository } from './repositories/posts.reposiory';
import {
  FoundPostData,
  ReturningPostData,
} from '../../common/types/posts.type';

@ApiTags('Operations with posts')
@ApiBearerAuth('access-token')
@Controller('api/posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @ApiOperation({ summary: 'Creates posts' })
  @ApiResponse({ status: 200, type: Post })
  @ApiConsumes('multipart/form-data')
  @Post('/create')
  @UseGuards(AuthGuard)
  @UseInterceptors(FilesInterceptor('files'))
  async createPost(@Body() dto: CreatePostDto, @UploadedFiles() files) {
    const profileId: string = context.get(CONTEXT_KEYS.USER).profileId;
    return await this.postsService.createPost(profileId, dto, files);
  }

  @ApiOperation({ summary: 'Returns all posts of profile' })
  @ApiResponse({ status: 200, type: Post })
  @Get('/allOfProfile/:profileId')
  async getByAccount(@Param('profileId') profileId: string) {
    return await this.postsService.getByProfile(profileId);
  }

  @ApiOperation({
    summary: 'Return all posts of profiles that user is subscribed on',
  })
  @ApiResponse({ status: 200, type: Post })
  @ApiConsumes('multipart/form-data')
  @Get(`/allOfSubscribedOn/`)
  @UseGuards(AuthGuard)
  async getAllPostsOfSubscribedOnUsers(): Promise<ReturningPostData[]> {
    const profileId: string = context.get(CONTEXT_KEYS.USER).profileId;
    return await this.postsService.getAllPostsOfSubscribedOn(profileId);
  }

  @ApiOperation({ summary: 'Updates posts' })
  @ApiResponse({ status: 200, type: Post })
  @ApiConsumes('multipart/form-data')
  @Put('/edit/:postId')
  @UseGuards(AuthGuard)
  @UseInterceptors(FilesInterceptor('files'))
  async editPost(
    @Param('postId') postId: string,
    @Body() dto: CreatePostDto,
    @UploadedFiles() files,
  ) {
    const profileId: string = context.get(CONTEXT_KEYS.USER).profileId;
    return await this.postsService.updatePost(postId, profileId, dto, files);
  }

  @ApiOperation({ summary: 'Deletes posts' })
  @ApiResponse({ status: 200, type: Post })
  @Delete('/delete/:postId')
  @UseGuards(AuthGuard)
  async deletePost(@Param('postId') postId: string) {
    const profileId: string = context.get(CONTEXT_KEYS.USER).profileId;
    return await this.postsService.deletePost(postId, profileId);
  }

  @ApiOperation({ summary: 'Adds like to posts' })
  @ApiResponse({ status: 200, type: PostLike })
  @Post('like/:postId')
  @UseGuards(AuthGuard)
  async likePost(@Param('postId') postId: string) {
    const profileId: string = context.get(CONTEXT_KEYS.USER).profileId;
    return this.postsService.addLike(postId, profileId);
  }

  @ApiOperation({ summary: 'Removes likes from posts' })
  @ApiResponse({ status: 200, type: PostLike })
  @Delete('unlike/:postId')
  @UseGuards(AuthGuard)
  async unlikePost(@Param('postId') postId: string) {
    const profileId: string = context.get(CONTEXT_KEYS.USER).profileId;
    return this.postsService.removeLike(postId, profileId);
  }

  @ApiOperation({ summary: 'Returns all likes of post' })
  @ApiResponse({ status: 200, type: PostLike })
  @Get('/allLikes/:postId')
  async getAllLikes(@Param('postId') postId: string) {
    return this.postsService.getAllLikesOfPost(postId);
  }

  @ApiOperation({ summary: 'Archives post' })
  @ApiResponse({ status: 200, type: Post })
  @Put(`/archive/:postIs`)
  @UseGuards(AuthGuard)
  async archivePost(@Param(`postId`) postId: string) {
    const profileId: string = context.get(CONTEXT_KEYS.USER).profileId;
    return await this.postsService.archivePost(postId, profileId);
  }
}
