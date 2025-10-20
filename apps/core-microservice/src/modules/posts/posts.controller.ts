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
import { PostLike } from '../../common/entities/postsDedicated/post-like.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { context, CONTEXT_KEYS } from '../../common/cls/request-context';

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
    const profileId = context.get(CONTEXT_KEYS.USER).profile_id;
    return await this.postsService.createPost(profileId, dto, files);
  }

  @ApiOperation({ summary: 'Returns all posts of profile' })
  @ApiResponse({ status: 200, type: Post })
  @Get('/allOfProfile/:profileId')
  async getByAccount(@Param('profileId') profileId: string) {
    return await this.postsService.getByProfile(profileId);
  }

  @ApiOperation({ summary: 'Updates posts' })
  @ApiResponse({ status: 200, type: Post })
  @ApiConsumes('multipart/form-data')
  @Put('/edit/:postId')
  @UseInterceptors(FilesInterceptor('files'))
  async editPost(
    @Param('postId') postId: string,
    @Body() dto: CreatePostDto,
    @UploadedFiles() files,
  ) {
    const profileId = '27b439b8-9bbc-4425-9690-8ecc73dcbc49'; //TODO get from CLS when auth module ready
    return await this.postsService.updatePost(postId, profileId, dto, files);
  }

  @ApiOperation({ summary: 'Deletes posts' })
  @ApiResponse({ status: 200, type: Post })
  @Delete('/delete/:postId')
  async deletePost(@Param('postId') postId: string) {
    const profileId = '27b439b8-9bbc-4425-9690-8ecc73dcbc49'; //TODO get from CLS when auth module ready
    return await this.postsService.deletePost(postId, profileId);
  }

  @ApiOperation({ summary: 'Adds like to posts' })
  @ApiResponse({ status: 200, type: PostLike })
  @Post('like/:postId')
  async likePost(@Param('postId') postId: string) {
    const profileId = '27b439b8-9bbc-4425-9690-8ecc73dcbc49'; //TODO get from CLS when auth module ready
    return this.postsService.addLike(postId, profileId);
  }

  @ApiOperation({ summary: 'Removes likes from posts' })
  @ApiResponse({ status: 200, type: PostLike })
  @Delete('unlike/:postId')
  async unlikePost(@Param('postId') postId: string) {
    const profileId = '27b439b8-9bbc-4425-9690-8ecc73dcbc49'; //TODO get from CLS when auth module ready
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
  async archivePost(@Param(`postId`) postId: string) {
    const profileId = '27b439b8-9bbc-4425-9690-8ecc73dcbc49'; //TODO get from CLS when auth module ready
    return await this.postsService.archivePost(postId, profileId);
  }
}
