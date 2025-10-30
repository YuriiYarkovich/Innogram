import { BadRequestException, Injectable } from '@nestjs/common';
import { CommentsRepository } from './repositories/comments.repository';
import { PostsRepository } from '../posts/repositories/posts.reposiory';
import { CommentLikeRepository } from './repositories/comment-like.repository';
import { CreateCommentDto } from './dto/crete-comment.dto';
import { Comment } from '../../common/entities/comments/comment.entity';
import { Post } from 'src/common/entities/posts/post.entity';
import { CommentLike } from '../../common/entities/comments/comment-like.entity';
import { exists } from 'node:fs';

@Injectable()
export class CommentsService {
  constructor(
    private commentsRepository: CommentsRepository,
    private postsRepository: PostsRepository,
    private commentLikeRepository: CommentLikeRepository,
  ) {}

  async createComment(
    dto: CreateCommentDto,
    postId: string,
    profileId: string,
  ): Promise<Comment> {
    await this.checkIfPostExists(postId);

    return await this.commentsRepository.createComment(dto, postId, profileId);
  }

  private async checkIfPostExists(postId: string) {
    const post: Post | null = await this.postsRepository.findPostById(postId);
    if (!post) throw new BadRequestException('There is no such post!');
  }

  async getAllCommentsOfPost(postId: string): Promise<Comment[]> {
    await this.checkIfPostExists(postId);

    return await this.commentsRepository.findAllCommentsOfPost(postId);
  }

  async updateComment(
    commentId: string,
    profileId: string,
    dto: CreateCommentDto,
  ): Promise<Comment | null> {
    await this.checkIfCommentExist(commentId, profileId);
    return await this.commentsRepository.updateComment(commentId, dto);
  }

  private async checkIfCommentExist(
    commentId: string,
    profileId: string,
  ): Promise<Comment> {
    const comment: Comment | null =
      await this.commentsRepository.getCommentByIdAndProfile(
        commentId,
        profileId,
      );
    if (!comment) throw new BadRequestException('There are no such comment!');
    return comment;
  }

  private async checkIfLikeExist(
    commentId: string,
    profileId: string,
  ): Promise<boolean> {
    const like: CommentLike | null = await this.commentLikeRepository.getLike(
      commentId,
      profileId,
    );
    return !!like;
  }

  async deleteComment(commentId: string, profileId: string): Promise<Comment> {
    const comment: Comment = await this.checkIfCommentExist(
      commentId,
      profileId,
    );
    await this.commentsRepository.deleteComment(commentId);
    return comment;
  }

  async likeComment(
    commentId: string,
    profileId: string,
  ): Promise<CommentLike> {
    await this.checkIfCommentExist(commentId, profileId);
    if (await this.checkIfLikeExist(commentId, profileId))
      throw new BadRequestException('This like already exists!');

    return await this.commentLikeRepository.likeComment(commentId, profileId);
  }

  async unlikeComment(
    commentId: string,
    profileId: string,
  ): Promise<CommentLike> {
    const like: CommentLike | null = await this.commentLikeRepository.getLike(
      commentId,
      profileId,
    );
    if (!like)
      throw new BadRequestException(`This comment isn't liked by this user!`);
    await this.commentLikeRepository.unlikeComment(like?.id);

    return like;
  }

  async getAllLikesOfComment(commentId: string): Promise<CommentLike[]> {
    return await this.commentLikeRepository.getAllLikesOfComment(commentId);
  }
}
