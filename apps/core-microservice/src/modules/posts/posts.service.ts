import { Injectable } from '@nestjs/common';
import { Post } from '../../common/entities/postsDedicated/post.entity';
import { PostsRepository } from './posts.reposiory';
import { DataSource } from 'typeorm';
import { MinioService } from '../minio/minio.service';
import { PostAsset } from '../../common/entities/postsDedicated/post-asset.entity';
import { PostAssetRepository } from './post-asset.repository';

@Injectable()
export class PostsService {
  constructor(
    private postsRepository: PostsRepository,
    private dataSource: DataSource,
    private minioService: MinioService,
    private postAssetRepository: PostAssetRepository,
  ) {}

  async createPost(profile_id: string, content: string, files): Promise<Post> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const post = await this.postsRepository.createPost(
        profile_id,
        content,
        queryRunner,
      );

      let order = 0;
      for (const file of files) {
        const fileData = await this.minioService.uploadFile(file);
        queryRunner.manager.create(PostAsset, {
          hashed_file_name: fileData.hashedFileName,
        });
        await this.postAssetRepository.addAsset(
          fileData.hashedFileName,
          post.id,
          queryRunner,
          fileData.type,
          ++order,
        );
      }

      await queryRunner.commitTransaction();

      return post;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    }
  }

  async getByProfile(profileId: string) {
    const foundPosts = await this.postsRepository.getByProfile(profileId);

    for (const post of foundPosts) {
      await Promise.all(
        post.postAssets.map(async (postAsset) => {
          const url = await this.minioService.getPublicUrl(
            postAsset.hashed_file_name,
          );
          postAsset.url = url;
        }),
      );
    }
    return foundPosts;
  }
}
