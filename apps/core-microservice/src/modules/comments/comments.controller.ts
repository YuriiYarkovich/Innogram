import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CommentLike } from '../../common/entities/comments/comment-like.entity';
import { CreateCommentDto } from './dto/crete-comment.dto';
import { Comment } from '../../common/entities/comments/comment.entity';
import { context, CONTEXT_KEYS } from '../../common/cls/request-context';
import { AuthGuard } from '../../common/guards/auth.guard';
import { ReturningCommentData } from '../../common/types/comment';

@ApiTags('Operations with comments')
@ApiBearerAuth('access-token')
@Controller('/api/comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @ApiOperation({ summary: 'Adds comment to the post' })
  @ApiResponse({ status: 200, type: Comment })
  @Post(`/add`)
  @UseGuards(AuthGuard)
  async createComment(@Body() dto: CreateCommentDto): Promise<Comment> {
    const profileId: string = context.get(CONTEXT_KEYS.USER).profileId;
    return await this.commentsService.createComment(dto, profileId);
  }

  @ApiOperation({ summary: 'Returns all comments of posts' })
  @ApiResponse({ status: 200, type: Comment })
  @Get(`/allOfPost/:postId`)
  @UseGuards(AuthGuard)
  async getAllCommentsOfPost(
    @Param('postId') postId: string,
  ): Promise<ReturningCommentData[]> {
    const currentProfileId: string = context.get(CONTEXT_KEYS.USER).profileId;
    return await this.commentsService.getAllCommentsOfPost(
      postId,
      currentProfileId,
    );
  }

  @ApiOperation({ summary: 'Edit comments' })
  @ApiResponse({ status: 200, type: Comment })
  @Put(`/update/:commentId`)
  @UseGuards(AuthGuard)
  async updateComment(
    @Body() dto: CreateCommentDto,
    @Param('commentId') commentId: string,
  ): Promise<Comment | null> {
    const profileId: string = context.get(CONTEXT_KEYS.USER).profileId;
    return await this.commentsService.updateComment(commentId, profileId, dto);
  }

  @ApiOperation({ summary: 'Deletes comments' })
  @ApiResponse({ status: 200, type: Comment })
  @Delete(`/delete/:commentId`)
  @UseGuards(AuthGuard)
  async deleteComment(@Param('commentId') commentId: string): Promise<Comment> {
    const profileId: string = context.get(CONTEXT_KEYS.USER).profileId;
    return await this.commentsService.deleteComment(commentId, profileId);
  }

  @ApiOperation({ summary: 'Adds like to the post' })
  @ApiResponse({ status: 200, type: CommentLike })
  @Post(`/like/:commentId`)
  @UseGuards(AuthGuard)
  async likeComment(
    @Param('commentId') commentId: string,
  ): Promise<CommentLike> {
    const profileId: string = context.get(CONTEXT_KEYS.USER).profileId;
    return await this.commentsService.likeComment(commentId, profileId);
  }

  @ApiOperation({ summary: 'Removes like from comment' })
  @ApiResponse({ status: 200, type: CommentLike })
  @Delete(`/unlike/:commentId`)
  @UseGuards(AuthGuard)
  async unlikeComment(
    @Param('commentId') commentId: string,
  ): Promise<CommentLike> {
    const profileId: string = context.get(CONTEXT_KEYS.USER).profileId;
    return await this.commentsService.unlikeComment(commentId, profileId);
  }

  @ApiOperation({ summary: 'Returns info about all likes of comment' })
  @ApiResponse({ status: 200, type: CommentLike })
  @Get(`/allLikes/:commentId`)
  async getAllLikesOfComment(
    @Param('commentId') commentId: string,
  ): Promise<CommentLike[]> {
    return await this.commentsService.getAllLikesOfComment(commentId);
  }
}
