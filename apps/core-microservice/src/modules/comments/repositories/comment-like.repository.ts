import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentLike } from '../../../common/entities/commentsDedicated/comment-like.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CommentLikeRepository {
  constructor(
    @InjectRepository(CommentLike)
    private commentLikeRepository: Repository<CommentLike>,
  ) {}

  async likeComment(commentId: string, profileId: string) {
    const like = this.commentLikeRepository.create({
      comment_id: commentId,
      profile_id: profileId,
    });

    await this.commentLikeRepository.save(like);

    return like;
  }

  async getLike(commentId: string, profileId: string) {
    return await this.commentLikeRepository.findOne({
      where: { comment_id: commentId, profile_id: profileId },
    });
  }

  async getAllLikesOfComment(commentId: string) {
    return await this.commentLikeRepository.find({
      where: { comment_id: commentId },
    });
  }

  async unlikeComment(likeId: string) {
    await this.commentLikeRepository.delete(likeId);
  }
}
