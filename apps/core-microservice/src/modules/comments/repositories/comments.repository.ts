import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../../../common/entities/comments/comment.entity';
import { CreateCommentDto } from '../dto/crete-comment.dto';
import { CommentStatus } from '../../../common/enums/comment.enum';
import { FindingCommentData } from '../../../common/types/comment';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectRepository(Comment) private commentsRepository: Repository<Comment>,
  ) {}

  async createComment(
    dto: CreateCommentDto,
    profileId: string,
  ): Promise<Comment> {
    const createdComment: Comment = this.commentsRepository.create({
      ...dto,
      profileId: profileId,
    });

    await this.commentsRepository.save(createdComment);

    return createdComment;
  }

  async findAllCommentsOfPost(postId: string): Promise<FindingCommentData[]> {
    return await this.commentsRepository.query(
      `
        SELECT c.id                                                                    AS "commentId",
               p.id                                                                    AS "authorProfileId",
               p.username                                                              AS "authorUsername",
               p.avatar_filename                                                       AS "authorAvatarFilename",
               c.content                                                               AS "commentContent",
               (SELECT COUNT(*) FROM main.comment_likes cl WHERE cl.comment_id = c.id) AS "likesAmount",
               CASE
                 WHEN EXTRACT(EPOCH FROM (NOW() - c.created_at)) / 3600 < 10
                   THEN ROUND(EXTRACT(EPOCH FROM (NOW() - c.created_at)) / 3600::numeric, 1)
                 ELSE ROUND(EXTRACT(EPOCH FROM (NOW() - c.created_at)) / 3600::numeric)
                 END                                                                   AS "timePast",
               c.parent_comment_id                                                     AS "parentCommentId"
        FROM main.comments AS c
               LEFT JOIN main.profiles AS p ON c.profile_id = p.id
        WHERE c.post_id = $1
          AND c.status = $2
        ORDER BY c.created_at DESC
      `,
      [postId, CommentStatus.ACTIVE],
    );
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
