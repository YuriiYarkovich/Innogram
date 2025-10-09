import { BadRequestException, Injectable } from '@nestjs/common';
import { Post } from '../../common/entities/postsDedicated/post.entity';
import { PostsRepository } from './repositories/posts.reposiory';
import { DataSource, QueryRunner } from 'typeorm';
import { MinioService } from '../minio/minio.service';
import { PostAsset } from '../../common/entities/postsDedicated/post-asset.entity';
import { PostAssetRepository } from './repositories/post-asset.repository';
import { PostLikeRepository } from './repositories/post-like.repository';
import { File as MulterFile } from 'multer';

@Injectable()
export class PostsService {
  constructor(
    private postsRepository: PostsRepository,
    private dataSource: DataSource,
    private minioService: MinioService,
    private postAssetRepository: PostAssetRepository,
    private postLikeRepository: PostLikeRepository,
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
      await this.postAssetRepository.createPostAsset(
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

  async updatePost(
    postId: string,
    profileId: string,
    content: string,
    files: MulterFile[],
  ) {
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

      const existingFileNames =
        updatedPost?.postAssets?.map((a) => a.hashed_file_name) ?? [];
      const newFileNames = files.map((f) => f.originalname);

      const namesToAdd = newFileNames.filter(
        (name) => !existingFileNames.includes(name),
      );
      const namesToRemove = existingFileNames.filter(
        (name) => !newFileNames.includes(name),
      );

      if (namesToRemove.length > 0) {
        for (const fileName of namesToRemove) {
          const asset =
            await this.postAssetRepository.findAssetByName(fileName);
          if (!asset) continue;

          await this.postAssetRepository.deletePostAsset(asset.id, queryRunner);
          await this.minioService.deleteFile(fileName);
        }
      }

      if (namesToAdd.length > 0) {
        const existingAssets =
          await this.postAssetRepository.findAssetsByPost(postId);
        let order = existingAssets.length;

        const filesToAdd = files.filter((f) =>
          namesToAdd.includes(f.originalname),
        );

        for (const file of filesToAdd) {
          const newAsset = await this.minioService.uploadFile(file);
          await this.postAssetRepository.createPostAsset(
            newAsset.hashedFileName,
            postId,
            queryRunner,
            newAsset.type,
            ++order,
          );
        }
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

  async addLike(postId: string, profileId: string) {
    const like = await this.postLikeRepository.findLike(postId, profileId);
    if (like)
      throw new BadRequestException('Post is already liked by this user');
    return await this.postLikeRepository.addLike(postId, profileId);
  }

  async removeLike(postId: string, profileId: string) {
    const like = await this.postLikeRepository.findLike(postId, profileId);
    if (!like)
      throw new BadRequestException(`This users hasn't liked that post`);
    return await this.postLikeRepository.removeLike(postId, profileId);
  }

  async getAllLikesOfPost(postId: string) {
    const post = await this.postsRepository.findPostById(postId);
    if (!post) throw new BadRequestException(`This post doesn't exist`);

    return await this.postLikeRepository.findAllLikesOfPost(postId);
  }
}
