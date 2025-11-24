import { BadRequestException, Injectable } from '@nestjs/common';
import { QueryRunner, Repository } from 'typeorm';
import { PostAsset } from '../../../common/entities/posts/post-asset.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AssetType } from '../../../common/enums/message.enum';

@Injectable()
export class PostAssetRepository {
  constructor(
    @InjectRepository(PostAsset)
    private postAssetRepository: Repository<PostAsset>,
  ) {}

  async createPostAsset(
    hashedFileName: string,
    postId: string,
    queryRunner: QueryRunner,
    fileType: string,
    order: number,
  ): Promise<PostAsset> {
    if (fileType !== 'image' && fileType !== 'video') {
      throw new BadRequestException('Invalid type value');
    }
    const postAsset: PostAsset = queryRunner.manager.create(PostAsset, {
      postId: postId,
      hashedFileName: hashedFileName,
      type: fileType as AssetType,
      order,
    });

    await queryRunner.manager.save(postAsset);
    return postAsset;
  }

  async findAssetsByPost(postId: string): Promise<PostAsset[]> {
    return await this.postAssetRepository.find({
      where: { postId: postId },
    });
  }

  async findAssetByName(hashedFileName: string): Promise<PostAsset | null> {
    return await this.postAssetRepository.findOne({
      where: {
        hashedFileName: hashedFileName,
      },
    });
  }

  async deletePostAsset(assetId: string, queryRunner: QueryRunner) {
    await queryRunner.manager.delete(PostAsset, { id: assetId });
  }
}
