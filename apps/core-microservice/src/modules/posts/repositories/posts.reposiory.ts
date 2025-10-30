import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from '../../../common/entities/posts/post.entity';
import { QueryRunner, Repository } from 'typeorm';
import { CreatePostDto } from '../dto/create-post.dto';
import { PostStatus } from '../../../common/enums/post.enum';

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

  async getByProfile(profileId: string): Promise<Post[]> {
    return await this.postRepository.find({
      relations: {
        postAssets: true,
        postLikes: true,
      },
      where: [
        {
          profileId: profileId,
          status: PostStatus.ACTIVE,
        },
        {
          profileId: profileId,
          status: PostStatus.ARCHIVED,
        },
      ],
    });
  }

  async getPostByIdAndProfile(
    profileId: string,
    postId: string,
  ): Promise<Post | null> {
    return await this.postRepository.findOne({
      where: [
        {
          profileId: profileId,
          id: postId,
          status: PostStatus.ACTIVE,
        },
        {
          profileId: profileId,
          id: postId,
          status: PostStatus.ARCHIVED,
        },
      ],
    });
  }

  async updatePost(
    postId: string,
    dto: CreatePostDto,
    queryRunner: QueryRunner,
  ): Promise<Post> {
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

  async deletePost(postId: string): Promise<Post | null> {
    await this.postRepository.update(postId, { status: PostStatus.DELETED });

    return await this.findPostById(postId);
  }

  async findPostById(postId: string): Promise<Post | null> {
    return await this.postRepository.findOne({ where: { id: postId } });
  }

  async archivePost(postId: string): Promise<Post | null> {
    await this.postRepository.update(
      { id: postId },
      { status: PostStatus.ARCHIVED },
    );
    return await this.findPostById(postId);
  }
}
