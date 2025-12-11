import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from '../../../common/entities/posts/post.entity';
import { In, QueryRunner, Repository } from 'typeorm';
import { CreatePostDto } from '../dto/create-post.dto';
import { PostStatus } from '../../../common/enums/post.enum';
import { FoundPostData } from '../../../common/types/posts.type';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectRepository(Post) private postRepository: Repository<Post>,
  ) {}

  async createPost(
    profileId: string,
    dto: CreatePostDto,
    queryRunner: QueryRunner,
  ): Promise<Post> {
    const post: Post = queryRunner.manager.create(Post, {
      content: dto.content,
      profileId: profileId,
    });
    await queryRunner.manager.save(post);
    return post;
  }

  async getPostByIdAndProfile(
    profileId: string,
    postId: string,
  ): Promise<Post | null> {
    return await this.postRepository.findOne({
      where: {
        profileId: profileId,
        id: postId,
        status: In([PostStatus.ACTIVE, PostStatus.ARCHIVED]),
      },
    });
  }

  async updatePost(
    postId: string,
    dto: CreatePostDto,
    queryRunner: QueryRunner,
  ) {
    await queryRunner.manager.update(
      Post,
      { id: postId },
      { content: dto.content },
    );

    const updatedPost: Post | null = await queryRunner.manager.findOne(Post, {
      relations: { postAssets: true },
      where: { id: postId },
    });

    if (!updatedPost) throw new InternalServerErrorException();

    return updatedPost;
  }

  async deletePost(postId: string) {
    await this.postRepository.update(postId, { status: PostStatus.DELETED });

    return await this.findPostById(postId);
  }

  async findPostById(postId: string) {
    const rows: FoundPostData[] = await this.postRepository.query(
      `
        SELECT p.id                                                            AS "postId",
               p.profile_id                                                    AS "profileId",
               pr.username,
               pr.avatar_filename                                              AS "profileAvatarFilename",
               p.content,
               CASE
                 WHEN EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 3600 < 10
                   THEN ROUND(EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 3600::numeric, 1)
                 ELSE ROUND(EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 3600::numeric)
                 END                                                           AS "timePast",
               p.created_at                                                    AS "createdAt",
               (SELECT COUNT(*) FROM main.post_likes l WHERE l.post_id = p.id) AS "likesCount",
               p.status
        FROM main.posts AS p
               LEFT JOIN main.profiles AS pr ON p.profile_id = pr.id
        WHERE p.id = $1
        ORDER BY p.created_at DESC
      `,
      [postId],
    );

    return rows[0];
  }

  async archivePost(postId: string) {
    await this.postRepository.update(
      { id: postId },
      { status: PostStatus.ARCHIVED },
    );
    return await this.findPostById(postId);
  }

  async unarchivePost(postId: string) {
    await this.postRepository.update(
      { id: postId },
      { status: PostStatus.ACTIVE },
    );
    return await this.findPostById(postId);
  }

  async getAllOfProfileList(profileIds: string[]): Promise<FoundPostData[]> {
    return await this.postRepository.query(
      `
        SELECT p.id                                                            AS "postId",
               p.profile_id                                                    AS "profileId",
               pr.username,
               pr.avatar_filename                                              AS "profileAvatarFilename",
               p.content,
               CASE
                 WHEN EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 3600 < 10
                   THEN ROUND(EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 3600::numeric, 1)
                 ELSE ROUND(EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 3600::numeric)
                 END                                                           AS "timePast",
               p.created_at                                                    AS "createdAt",
               (SELECT COUNT(*) FROM main.post_likes l WHERE l.post_id = p.id) AS "likesCount",
               p.status
        FROM main.posts AS p
               LEFT JOIN main.profiles AS pr ON p.profile_id = pr.id
        WHERE p.profile_id = ANY ($1)
          AND status = $2
        ORDER BY p.created_at DESC
      `,
      [profileIds, PostStatus.ACTIVE],
    );
  }

  async getAllOfSubscribedOn(
    subscriptionsProfilesIds: string[],
    lastLoadedPostCreatedAt: string,
  ): Promise<FoundPostData[]> {
    return await this.postRepository.query(
      `
        SELECT p.id                                                            AS "postId",
               p.profile_id                                                    AS "profileId",
               pr.username,
               pr.avatar_filename                                              AS "profileAvatarFilename",
               p.content,
               CASE
                 WHEN EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 3600 < 10
                   THEN ROUND(EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 3600::numeric, 1)
                 ELSE ROUND(EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 3600::numeric)
                 END                                                           AS "timePast",
               p.created_at                                                    AS "createdAt",
               (SELECT COUNT(*) FROM main.post_likes l WHERE l.post_id = p.id) AS "likesCount",
               p.status
        FROM main.posts AS p
               LEFT JOIN main.profiles AS pr ON p.profile_id = pr.id
        WHERE p.profile_id = ANY ($1)
          AND status = $2
          AND p.created_at < $3::timestamp
        ORDER BY p.created_at DESC
        LIMIT 10
      `,
      [subscriptionsProfilesIds, PostStatus.ACTIVE, lastLoadedPostCreatedAt],
    );
  }

  async preloadFirstPostOfSubscribedOn(subscriptionsProfilesIds: string[]) {
    const rows = await this.postRepository.query<FoundPostData[]>(
      `
        SELECT p.id                                                            AS "postId",
               p.profile_id                                                    AS "profileId",
               pr.username,
               pr.avatar_filename                                              AS "profileAvatarFilename",
               p.content,
               CASE
                 WHEN EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 3600 < 10
                   THEN ROUND(EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 3600::numeric, 1)
                 ELSE ROUND(EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 3600::numeric)
                 END                                                           AS "timePast",
               p.created_at                                                    AS "createdAt",
               (SELECT COUNT(*) FROM main.post_likes l WHERE l.post_id = p.id) AS "likesCount",
               p.status
        FROM main.posts AS p
               LEFT JOIN main.profiles AS pr ON p.profile_id = pr.id
        WHERE p.profile_id = ANY ($1)
          AND status = $2
        ORDER BY p.created_at DESC
        LIMIT 1
      `,
      [subscriptionsProfilesIds, PostStatus.ACTIVE],
    );

    return rows[0];
  }

  async getAllArchivedPosts(profileId: string) {
    return await this.postRepository.query<FoundPostData[]>(
      `
        SELECT p.id                                                            AS "postId",
               p.profile_id                                                    AS "profileId",
               pr.username,
               pr.avatar_filename                                              AS "profileAvatarFilename",
               p.content,
               CASE
                 WHEN EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 3600 < 10
                   THEN ROUND(EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 3600::numeric, 1)
                 ELSE ROUND(EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 3600::numeric)
                 END                                                           AS "timePast",
               p.created_at                                                    AS "createdAt",
               (SELECT COUNT(*) FROM main.post_likes l WHERE l.post_id = p.id) AS "likesCount",
               p.status
        FROM main.posts AS p
               LEFT JOIN main.profiles AS pr ON p.profile_id = pr.id
        WHERE p.profile_id = $1
          AND status = $2
        ORDER BY p.created_at DESC
      `,
      [profileId, PostStatus.ARCHIVED],
    );
  }

  async findActivity(currentProfileId: string) {
    return await this.postRepository.query<FoundPostData[]>(
      `
        SELECT p.id                                                            AS "postId",
               p.profile_id                                                    AS "profileId",
               pr.username,
               pr.avatar_filename                                              AS "profileAvatarFilename",
               p.content,
               CASE
                 WHEN EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 3600 < 10
                   THEN ROUND(EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 3600::numeric, 1)
                 ELSE ROUND(EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 3600::numeric)
                 END                                                           AS "timePast",
               p.created_at                                                    AS "createdAt",
               (SELECT COUNT(*) FROM main.post_likes l WHERE l.post_id = p.id) AS "likesCount",
               p.status
        FROM main.posts AS p
               LEFT JOIN main.profiles AS pr ON p.profile_id = pr.id
        WHERE p.status = $2
          AND (
          EXISTS (
            SELECT 1 FROM main.post_likes pl
            WHERE pl.post_id = p.id AND pl.profile_id = $1
          )
            OR EXISTS (
            SELECT 1 FROM main.comments c
            WHERE c.post_id = p.id AND c.profile_id = $1
          )
          )
        ORDER BY p.created_at DESC
      `,
      [currentProfileId, PostStatus.ACTIVE],
    );
  }
}
