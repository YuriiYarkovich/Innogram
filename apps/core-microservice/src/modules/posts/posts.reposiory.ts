import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from '../../common/entities/postsDedicated/post.entity';
import { QueryRunner, Repository } from 'typeorm';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectRepository(Post) private postRepository: Repository<Post>,
  ) {}

  async createPost(
    profileId: string,
    content: string,
    queryRunner: QueryRunner,
  ): Promise<Post> {
    const post = queryRunner.manager.create(Post, {
      content,
      profile_id: profileId,
    });
    await queryRunner.manager.save(post);
    return post;
  }

  async getByProfile(profileId: string) {
    return await this.postRepository.find({
      relations: {
        postAssets: true,
      },
      where: {
        profile_id: profileId,
      },
    });
  }

  async getPostByIdAndProfile(profileId: string, postId: string) {
    return await this.postRepository.findOne({
      where: {
        profile_id: profileId,
        id: postId,
      },
    });
  }

  async updatePost(
    postId: string,
    content: string,
    queryRunner: QueryRunner,
  ): Promise<Post> {
    await queryRunner.manager.update(Post, { id: postId }, { content });

    const updatedPost = await queryRunner.manager.findOne(Post, {
      where: { id: postId },
    });

    if (!updatedPost) throw new InternalServerErrorException();

    return updatedPost;
  }
}
