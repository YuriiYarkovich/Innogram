import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostAsset } from '../../common/entities/postsDedicated/post-asset.entity';
import { Post } from '../../common/entities/postsDedicated/post.entity';
import { QueryRunner, Repository } from 'typeorm';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectRepository(Post) private postRepository: Repository<Post>,
    @InjectRepository(PostAsset)
    private postAssetRepository: Repository<PostAsset>,
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
}
