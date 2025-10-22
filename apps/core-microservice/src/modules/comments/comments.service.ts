import { BadRequestException, Injectable } from '@nestjs/common';
import { CommentsRepository } from './repositories/comments.repository';
import { PostsRepository } from '../posts/repositories/posts.reposiory';
import { CommentLikeRepository } from './repositories/comment-like.repository';
import { CreateCommentDto } from './dto/crete-comment.dto';

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
  ) {
    await this.checkIfPostExists(postId);

    return await this.commentsRepository.createComment(dto, postId, profileId);
  }

  private async checkIfPostExists(postId: string) {
    const post = await this.postsRepository.findPostById(postId);
    if (!post) throw new BadRequestException('There is no such post!');
  }

  async getAllCommentsOfPost(postId: string) {
    await this.checkIfPostExists(postId);

    return await this.commentsRepository.findAllCommentsOfPost(postId);
  }

  async updateComment(
    commentId: string,
    profileId: string,
    dto: CreateCommentDto,
  ) {
    await this.checkIfCommentExist(commentId, profileId);
    return await this.commentsRepository.updateComment(commentId, dto);
  }

  private async checkIfCommentExist(commentId: string, profileId: string) {
    const comment = await this.commentsRepository.getCommentByIdAndProfile(
      commentId,
      profileId,
    );
    if (!comment) throw new BadRequestException('There are no such comment!');
    return comment;
  }

  private async checkIfLikeExist(commentId: string, profileId: string) {
    const like = await this.commentLikeRepository.getLike(commentId, profileId);
    return !!like;
  }

  async deleteComment(commentId: string, profileId: string) {
    const comment = await this.checkIfCommentExist(commentId, profileId);
    await this.commentsRepository.deleteComment(commentId);
    return comment;
  }

  async likeComment(commentId: string, profileId: string) {
    await this.checkIfCommentExist(commentId, profileId);
    if (await this.checkIfLikeExist(commentId, profileId))
      throw new BadRequestException('This like already exists!');

    return await this.commentLikeRepository.likeComment(commentId, profileId);
  }

  async unlikeComment(commentId: string, profileId: string) {
    const like = await this.commentLikeRepository.getLike(commentId, profileId);
    if (!like)
      throw new BadRequestException(`This comment isn't liked by this user!`);
    await this.commentLikeRepository.unlikeComment(like?.id);

    return like;
  }

  async getAllLikesOfComment(commentId: string) {
    return await this.commentLikeRepository.getAllLikesOfComment(commentId);
  }
}
