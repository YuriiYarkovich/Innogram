import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CommentLike } from '../../common/entities/commentsDedicated/comment-like.entity';
import { CreateCommentDto } from './dto/crete-comment.dto';

@ApiTags('Operations with comments')
@ApiBearerAuth('access-token')
@Controller('/api/comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @ApiOperation({ summary: 'Adds comment to the post' })
  @ApiResponse({ status: 200, type: Comment })
  @Post(`/add/:postId`)
  async createComment(
    @Body() dto: CreateCommentDto,
    @Param('postId') postId: string,
  ) {
    const profileId = '27b439b8-9bbc-4425-9690-8ecc73dcbc49'; //TODO get from CLS when auth module ready
    return await this.commentsService.createComment(dto, postId, profileId);
  }

  @ApiOperation({ summary: 'Returns all comments of posts' })
  @ApiResponse({ status: 200, type: Comment })
  @Get(`/allOfPost/:postId`)
  async getAllCommentsOfPost(@Param('postId') postId: string) {
    return await this.commentsService.getAllCommentsOfPost(postId);
  }

  @ApiOperation({ summary: 'Edit comments' })
  @ApiResponse({ status: 200, type: Comment })
  @Put(`/update/:commentId`)
  async updateComment(
    @Body() dto: CreateCommentDto,
    @Param('commentId') commentId: string,
  ) {
    const profileId = '27b439b8-9bbc-4425-9690-8ecc73dcbc49'; //TODO get from CLS when auth module ready
    return await this.commentsService.updateComment(commentId, profileId, dto);
  }

  @ApiOperation({ summary: 'Deletes comments' })
  @ApiResponse({ status: 200, type: Comment })
  @Delete(`/delete/:commentId`)
  async deleteComment(@Param('commentId') commentId: string) {
    const profileId = '27b439b8-9bbc-4425-9690-8ecc73dcbc49'; //TODO get from CLS when auth module ready
    return await this.commentsService.deleteComment(commentId, profileId);
  }

  @ApiOperation({ summary: 'Adds like to the post' })
  @ApiResponse({ status: 200, type: CommentLike })
  @Post(`/like/:commentId`)
  async likeComment(@Param('commentId') commentId: string) {
    const profileId = '27b439b8-9bbc-4425-9690-8ecc73dcbc49'; //TODO get from CLS when auth module ready
    return await this.commentsService.likeComment(commentId, profileId);
  }

  @ApiOperation({ summary: 'Removes like from comment' })
  @ApiResponse({ status: 200, type: CommentLike })
  @Delete(`/unlike/:commentId`)
  async unlikeComment(@Param('commentId') commentId: string) {
    const profileId = '27b439b8-9bbc-4425-9690-8ecc73dcbc49'; //TODO get from CLS when auth module ready
    return await this.commentsService.unlikeComment(commentId, profileId);
  }

  @ApiOperation({ summary: 'Returns info about all likes of comment' })
  @ApiResponse({ status: 200, type: CommentLike })
  @Get(`/allLikes/:commentId`)
  async getAllLikesOfComment(@Param('commentId') commentId: string) {
    return await this.commentsService.getAllLikesOfComment(commentId);
  }
}
