import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../../../common/entities/comments/comment.entity';
import { CreateCommentDto } from '../dto/crete-comment.dto';
import { CommentStatus } from '../../../common/enums/comment.enum';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectRepository(Comment) private commentsRepository: Repository<Comment>,
  ) {}

  async createComment(
    dto: CreateCommentDto,
    postId: string,
    profileId: string,
  ): Promise<Comment> {
    const createdComment: Comment = this.commentsRepository.create({
      postId: postId,
      content: dto.content,
      profileId: profileId,
    });

    await this.commentsRepository.save(createdComment);

    return createdComment;
  }

  async findAllCommentsOfPost(postId: string): Promise<Comment[]> {
    return await this.commentsRepository.find({
      relations: {
        commentLikes: true,
        comment_mentions: true,
      },
      where: {
        postId: postId,
        status: CommentStatus.ACTIVE,
      },
    });
  }

  async getCommentById(commentId: string): Promise<Comment | null> {
    return await this.commentsRepository.findOne({
      where: { id: commentId, status: CommentStatus.ACTIVE },
    });
  }

  async getCommentByIdAndProfile(
    commentId: string,
    profileId: string,
  ): Promise<Comment | null> {
    return await this.commentsRepository.findOne({
      where: {
        id: commentId,
        status: CommentStatus.ACTIVE,
        profileId: profileId,
      },
    });
  }

  async updateComment(
    commentId: string,
    dto: CreateCommentDto,
  ): Promise<Comment | null> {
    await this.commentsRepository.update(commentId, { content: dto.content });

    return await this.getCommentById(commentId);
  }

  async deleteComment(commentId: string) {
    await this.commentsRepository.update(commentId, {
      status: CommentStatus.DELETED,
    });
  }
}
