import { BadRequestException, Injectable } from '@nestjs/common';
import { Post } from '../../common/entities/posts/post.entity';
import { PostsRepository } from './repositories/posts.reposiory';
import { DataSource, QueryRunner } from 'typeorm';
import { MinioService } from '../minio/minio.service';
import { PostAsset } from '../../common/entities/posts/post-asset.entity';
import { PostAssetRepository } from './repositories/post-asset.repository';
import { PostLikeRepository } from './repositories/post-like.repository';
import { File as MulterFile } from 'multer';
import { CreatePostDto } from './dto/create-post.dto';
import { WrongUserException } from '../../common/exceptions/wrong-user.exception';
import { ProfileFollowRepository } from '../follows/profile-follow.repository';
import {
  FoundPostData,
  ReturningAssetData,
  ReturningPostData,
} from '../../common/types/posts.type';
import { PostLike } from '../../common/entities/posts/post-like.entity';

@Injectable()
export class PostsService {
  constructor(
    private postsRepository: PostsRepository,
    private dataSource: DataSource,
    private minioService: MinioService,
    private postAssetRepository: PostAssetRepository,
    private postLikeRepository: PostLikeRepository,
    private profileFollowRepository: ProfileFollowRepository,
  ) {}

  async createPost(
    profile_id: string,
    dto: CreatePostDto,
    files: MulterFile[],
  ): Promise<Post> {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const post: Post = await this.postsRepository.createPost(
        profile_id,
        dto,
        queryRunner,
      );

      await this.uploadFilesArray(files, queryRunner, post);

      await queryRunner.commitTransaction();

      return post;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  private async createReturningPostsArray(
    foundData: FoundPostData[],
    profileId: string,
  ): Promise<ReturningPostData[]> {
    const returningPostsData: ReturningPostData[] = [];
    for (const postData of foundData) {
      const assetsOfPost: PostAsset[] =
        await this.postAssetRepository.findAssetsByPost(postData.postId);
      const returningAssetsData: ReturningAssetData[] = [];
      for (const asset of assetsOfPost) {
        const assetData: ReturningAssetData = {
          url: '',
          order: 0,
        };
        const url: string | null = await this.minioService.getPublicUrl(
          asset.hashedFileName,
        );
        assetData.url = url;
        assetData.order = asset.order;
        returningAssetsData.push(assetData);
      }
      const like: PostLike | null = await this.postLikeRepository.findLike(
        postData.postId,
        profileId,
      );

      const profileAvatarUrl: string | null =
        await this.minioService.getPublicUrl(postData.profileAvatarFilename);

      const returningPostData: ReturningPostData = {
        postId: postData.postId,
        profileId: postData.profileId,
        profileAvatarUrl,
        username: postData.username,
        content: postData.content,
        timePast: postData.timePast,
        likesCount: postData.likesCount,
        liked: !!like,
        assets: returningAssetsData,
      };
      returningPostsData.push(returningPostData);
    }

    return returningPostsData;
  }

  async getAllPostsOfSubscribedOn(
    profileId: string,
  ): Promise<ReturningPostData[]> {
    const followedProfilesIds: string[] =
      await this.profileFollowRepository.getAllSubscribedOnUsersIds(profileId);
    followedProfilesIds.push(profileId);

    const foundData: FoundPostData[] =
      await this.postsRepository.getAllOfProfileList(followedProfilesIds);

    return await this.createReturningPostsArray(foundData, profileId);
  }

  async uploadFilesArray(
    files: MulterFile[],
    queryRunner: QueryRunner,
    post: Post,
  ) {
    for (let i: number = 0; i < files.length; i++) {
      const fileData: { hashedFileName: string; type: string } =
        await this.minioService.uploadFile(files[i]);
      queryRunner.manager.create(PostAsset, {
        hashedFileName: fileData.hashedFileName,
      });
      await this.postAssetRepository.createPostAsset(
        fileData.hashedFileName,
        post.id,
        queryRunner,
        fileData.type,
        i + 1,
      );
    }
  }

  async getByProfile(profileId: string): Promise<ReturningPostData[]> {
    const foundData: FoundPostData[] =
      await this.postsRepository.getAllOfProfileList([profileId]);

    return await this.createReturningPostsArray(foundData, profileId);
  }

  async updatePost(
    postId: string,
    profileId: string,
    dto: CreatePostDto,
    files: MulterFile[],
  ) {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
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
        dto,
        queryRunner,
      );

      const existingFileNames: string[] =
        updatedPost?.postAssets?.map((a) => a.hashedFileName) ?? [];
      const newFileNames: string[] = files.map((f) => f.originalname);

      const namesToAdd = newFileNames.filter(
        (name: string) => !existingFileNames.includes(name),
      );
      const namesToRemove = existingFileNames.filter(
        (name: string) => !newFileNames.includes(name),
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
    } finally {
      await queryRunner.release();
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

  async archivePost(postId: string, profileId: string) {
    const post = await this.postsRepository.getPostByIdAndProfile(
      postId,
      profileId,
    );
    if (!post)
      throw new WrongUserException('This user has not got post with this id!');

    return await this.postsRepository.archivePost(postId);
  }
}
