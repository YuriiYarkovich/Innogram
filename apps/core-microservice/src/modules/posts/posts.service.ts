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
    currentProfileId: string,
    dto: CreatePostDto,
    files: MulterFile[],
  ) {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const post: Post = await this.postsRepository.createPost(
        currentProfileId,
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
    currentProfileId: string,
  ): Promise<ReturningPostData[]> {
    const returningPostsData: ReturningPostData[] = [];
    for (const postData of foundData) {
      const returningPostData = await this.createReturningPostData(
        postData,
        profileId,
        currentProfileId,
      );

      returningPostsData.push(returningPostData);
    }

    return returningPostsData;
  }

  private async createReturningPostData(
    postData: FoundPostData,
    profileId: string,
    currentProfileId: string,
  ) {
    const assetsOfPost: PostAsset[] =
      await this.postAssetRepository.findAssetsByPost(postData.postId);
    const returningAssetsData: ReturningAssetData[] = [];
    for (const asset of assetsOfPost) {
      const assetData: ReturningAssetData = {
        url: '',
        order: 0,
      };
      const url: string | undefined = await this.minioService.getPublicUrl(
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

    const profileAvatarUrl: string | undefined =
      await this.minioService.getPublicUrl(postData.profileAvatarFilename);

    const isCreator: boolean = currentProfileId === postData.profileId;

    const returningPostData: ReturningPostData = {
      ...postData,
      profileAvatarUrl,
      liked: !!like,
      assets: returningAssetsData,
      isCreator,
    };
    return returningPostData;
  }

  async getAllPostsOfSubscribedOn(
    profileId: string,
  ): Promise<ReturningPostData[]> {
    const followedProfilesIds: string[] =
      await this.profileFollowRepository.getAllSubscribedOnUsersIds(profileId);
    followedProfilesIds.push(profileId);

    const foundData: FoundPostData[] =
      await this.postsRepository.getAllOfProfileList(followedProfilesIds);

    return await this.createReturningPostsArray(
      foundData,
      profileId,
      profileId,
    );
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

  async getByProfile(
    profileId: string,
    currentProfileId: string,
  ): Promise<ReturningPostData[]> {
    const foundData: FoundPostData[] =
      await this.postsRepository.getAllOfProfileList([profileId]);

    return await this.createReturningPostsArray(
      foundData,
      profileId,
      currentProfileId,
    );
  }

  async updatePost(
    postId: string,
    currentProfileId: string,
    dto: CreatePostDto,
    files: MulterFile[],
  ) {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    //array to keep information to load them after commit
    const filesToUploadAfterCommit: Array<{
      file: MulterFile;
      hashedFileName: string;
      type: string;
      order: number;
    }> = [];

    try {
      const foundPost = await this.postsRepository.getPostByIdAndProfile(
        currentProfileId,
        postId,
      );
      if (!foundPost) throw new BadRequestException(`Post couldn't be found`);

      const updatedPost = await this.postsRepository.updatePost(
        postId,
        dto,
        queryRunner,
      );

      //Getting existing assets with their order
      const existingAssets = updatedPost?.postAssets ?? [];

      //Creating map to search order by filename
      const existingFileNameToOrder = new Map<string, number>(
        existingAssets.map((asset) => [asset.hashedFileName, asset.order]),
      );

      const existingFileNames: string[] = existingAssets.map(
        (a) => a.hashedFileName,
      );
      const newFileNames: string[] = files.map((f) => f.originalname);

      const namesToAdd = newFileNames.filter(
        (name: string) => !existingFileNames.includes(name),
      );
      const namesToRemove = existingFileNames.filter(
        (name: string) => !newFileNames.includes(name),
      );

      //Collecting order from deleting files to reuse
      const availableOrders: number[] = [];

      if (namesToRemove.length > 0) {
        for (const fileName of namesToRemove) {
          const asset =
            await this.postAssetRepository.findAssetByName(fileName);
          if (!asset) continue;

          availableOrders.push(asset.order);

          await this.postAssetRepository.deletePostAsset(asset.id, queryRunner);
          await this.minioService.deleteFile(fileName); //TODO move files deletion after transaction commit
        }
      }

      //sorting freed order ascending
      availableOrders.sort((a, b) => a - b);

      const remainingAssets =
        await this.postAssetRepository.findAssetsByPost(postId);
      let maxOrder =
        remainingAssets.length > 0
          ? Math.max(...remainingAssets.map((a) => a.order))
          : 0;

      const filesToAdd = files.filter((f) =>
        namesToAdd.includes(f.originalname),
      );

      if (filesToAdd.length > 0) {
        let availableOrderIndex = 0;

        for (const file of filesToAdd) {
          //Generating hash name and getting type before uploading
          const hashedFileName = this.minioService.generateHashedFileName(
            file.originalname,
          );

          //Type validation
          const mimeType: string = file.mimetype;
          const isImage: boolean = mimeType.startsWith('image/');
          const isVideo: boolean = mimeType.startsWith('video/');

          if (!isImage && !isVideo)
            throw new BadRequestException('Unknown file type');

          let type: string;
          if (isVideo) {
            const duration: number = await this.minioService.getVideoDuration(
              file.buffer,
            );
            type = 'video';
            if (duration > 60) {
              throw new BadRequestException('Video is longer then one minute');
            }
          } else type = 'image';

          // Getting order for new file
          let order: number;
          if (availableOrderIndex < availableOrders.length) {
            //using freed order
            order = availableOrders[availableOrderIndex];
            availableOrderIndex++;
          } else {
            // using next
            order = ++maxOrder;
          }

          // Creating DB note with hashed name
          await this.postAssetRepository.createPostAsset(
            hashedFileName,
            postId,
            queryRunner,
            type,
            order,
          );

          // Saving uploading information after commit
          filesToUploadAfterCommit.push({
            file,
            hashedFileName,
            type,
            order,
          });
        }
      }

      const updatedPostData = await this.postsRepository.findPostById(postId);
      const returningPostData = await this.createReturningPostData(
        updatedPostData,
        currentProfileId,
        currentProfileId,
      );

      await queryRunner.commitTransaction();

      // after successfull commit loading files to minio
      if (filesToUploadAfterCommit.length > 0) {
        for (const fileInfo of filesToUploadAfterCommit) {
          await this.minioService.uploadFile(
            fileInfo.file,
            fileInfo.hashedFileName,
          );
        }
      }

      return returningPostData;
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

  async archivePost(postId: string, currentProfileId: string) {
    const post = await this.postsRepository.findPostById(postId);

    if (!post)
      throw new WrongUserException('This user has not got post with this id!');

    return await this.postsRepository.archivePost(postId);
  }

  async getAllArchivedPostsOfProfile(currentProfileId: string) {
    const foundPostsData =
      await this.postsRepository.getAllArchivedPosts(currentProfileId);

    const returningPostsData: ReturningPostData[] = [];

    for (const foundPostData of foundPostsData) {
      const returningPostData = await this.createReturningPostData(
        foundPostData,
        currentProfileId,
        currentProfileId,
      );

      returningPostsData.push(returningPostData);
    }

    return returningPostsData;
  }

  async unarchivePost(postId: string, currentProfileId: string) {
    let post = await this.postsRepository.findPostById(postId);

    if (!post) throw new BadRequestException('This post does not exist');

    await this.postsRepository.unarchivePost(postId);

    post = await this.postsRepository.findPostById(postId);

    return await this.createReturningPostData(
      post,
      currentProfileId,
      currentProfileId,
    );
  }
}
