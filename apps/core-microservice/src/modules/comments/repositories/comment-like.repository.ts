import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentLike } from '../../../common/entities/comments/comment-like.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CommentLikeRepository {
  constructor(
    @InjectRepository(CommentLike)
    private commentLikeRepository: Repository<CommentLike>,
  ) {}

  async likeComment(
    commentId: string,
    profileId: string,
  ): Promise<CommentLike> {
    const like: CommentLike = this.commentLikeRepository.create({
      commentId: commentId,
      profileId: profileId,
    });

    await this.commentLikeRepository.save(like);

    return like;
  }

  async getLike(
    commentId: string,
    profileId: string,
  ): Promise<CommentLike | null> {
    return await this.commentLikeRepository.findOne({
      where: { commentId: commentId, profileId: profileId },
    });
  }

  async getAllLikesOfComment(commentId: string): Promise<CommentLike[]> {
    return await this.commentLikeRepository.find({
      where: { commentId: commentId },
    });
  }

  async unlikeComment(likeId: string) {
    await this.commentLikeRepository.delete(likeId);
  }
}
