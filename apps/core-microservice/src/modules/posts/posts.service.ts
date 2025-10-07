import { BadRequestException, Injectable } from '@nestjs/common';
import { Post } from '../../common/entities/postsDedicated/post.entity';
import { PostsRepository } from './posts.reposiory';
import { DataSource, QueryRunner } from 'typeorm';
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
      /*for (const file of files) {
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
      }*/
      await this.uploadFilesArray(files, queryRunner, post, order);

      await queryRunner.commitTransaction();

      return post;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    }
  }

  async uploadFilesArray(
    files,
    queryRunner: QueryRunner,
    post: Post,
    order: number,
  ) {
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

  async updatePost(postId: string, profileId: string, content: string, files) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const foundPost = await this.postsRepository.getPostByIdAndProfile(
        profileId,
        postId,
      );

      if (!foundPost) throw new BadRequestException(`Post couldn't be found`);

      const updatedPost = await this.postsRepository.updatePost(
        postId,
        content,
        queryRunner,
      );

      const foundAssets = await this.postAssetRepository.foundAssetsOfPost(
        updatedPost.id,
      );

      if (foundAssets.length < 10 && files.length < 10 - foundAssets.length) {
        await this.uploadFilesArray(
          files,
          queryRunner,
          updatedPost,
          files.length,
        );
      } else {
        console.error(`Files length: ${files.length}`);
        throw new BadRequestException('Wrong files length');
      }

      await queryRunner.commitTransaction();

      return updatedPost;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    }
  }

  async deletePost(postId: string, profileId: string) {
    const foundPost = await this.postsRepository.getPostByIdAndProfile(
      profileId,
      postId,
    );

    if (!foundPost) throw new BadRequestException(`Post couldn't be found`);

    return await this.postsRepository.deletePost(postId);
  }
}
