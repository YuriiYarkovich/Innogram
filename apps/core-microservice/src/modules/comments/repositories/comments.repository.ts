import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../../../common/entities/commentsDedicated/comment.entity';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectRepository(Comment) private commentsRepository: Repository<Comment>,
  ) {}

  async createComment(content: string, postId: string, profileId: string) {
    const createdComment = this.commentsRepository.create({
      post_id: postId,
      content,
      profile_id: profileId,
    });

    await this.commentsRepository.save(createdComment);

    return createdComment;
  }

  async findAllCommentsOfPost(postId: string) {
    return await this.commentsRepository.find({
      relations: {
        commentLikes: true,
        comment_mentions: true,
      },
      where: {
        post_id: postId,
        status: 'active',
      },
    });
  }

  async getCommentById(commentId: string) {
    return await this.commentsRepository.findOne({
      where: { id: commentId, status: 'active' },
    });
  }

  async getCommentByIdAndProfile(commentId: string, profileId: string) {
    return await this.commentsRepository.findOne({
      where: { id: commentId, status: 'active', profile_id: profileId },
    });
  }

  async updateComment(commentId: string, content: string) {
    await this.commentsRepository.update(commentId, { content });

    return await this.getCommentById(commentId);
  }

  async deleteComment(commentId: string) {
    await this.commentsRepository.update(commentId, { status: 'deleted' });
  }
}
