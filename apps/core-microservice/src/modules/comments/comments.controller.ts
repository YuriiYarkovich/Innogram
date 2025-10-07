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

@Controller('/api/comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Post(`/add/:postId`)
  async createComment(
    @Body('content') content: string,
    @Param('postId') postId: string,
  ) {
    const profileId = '27b439b8-9bbc-4425-9690-8ecc73dcbc49'; //TODO get from CLS when auth module ready
    return await this.commentsService.createComment(content, postId, profileId);
  }

  @Get(`/allOfPost/:postId`)
  async getAllCommentsOfPost(@Param('postId') postId: string) {
    return await this.commentsService.getAllCommentsOfPost(postId);
  }

  @Put(`/update/:commentId`)
  async updateComment(
    @Body('content') content: string,
    @Param('commentId') commentId: string,
  ) {
    const profileId = '27b439b8-9bbc-4425-9690-8ecc73dcbc49'; //TODO get from CLS when auth module ready
    return await this.commentsService.updateComment(
      commentId,
      profileId,
      content,
    );
  }

  @Delete(`/delete/:commentId`)
  async deleteComment(@Param('commentId') commentId: string) {
    const profileId = '27b439b8-9bbc-4425-9690-8ecc73dcbc49'; //TODO get from CLS when auth module ready
    return await this.commentsService.deleteComment(commentId, profileId);
  }

  @Post(`/like/:commentId`)
  async likeComment(@Param('commentId') commentId: string) {
    const profileId = '27b439b8-9bbc-4425-9690-8ecc73dcbc49'; //TODO get from CLS when auth module ready
    return await this.commentsService.likeComment(commentId, profileId);
  }

  @Delete(`/unlike/:commentId`)
  async unlikeComment(@Param('commentId') commentId: string) {
    const profileId = '27b439b8-9bbc-4425-9690-8ecc73dcbc49'; //TODO get from CLS when auth module ready
    return await this.commentsService.unlikeComment(commentId, profileId);
  }

  @Get(`/allLikes/:commentId`)
  async getAllLikesOfComment(@Param('commentId') commentId: string) {
    return await this.commentsService.getAllLikesOfComment(commentId);
  }
}
