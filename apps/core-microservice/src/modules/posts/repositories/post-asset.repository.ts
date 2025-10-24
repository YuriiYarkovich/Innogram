import { BadRequestException, Injectable } from '@nestjs/common';
import { QueryRunner, Repository } from 'typeorm';
import { PostAsset } from '../../../common/entities/posts/post-asset.entity';
import { InjectRepository } from '@nestjs/typeorm';

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
  ) {
    if (fileType !== 'image' && fileType !== 'video') {
      throw new BadRequestException('Invalid type value');
    }
    const postAsset = queryRunner.manager.create(PostAsset, {
      post_id: postId,
      hashed_file_name: hashedFileName,
      type: fileType,
      order,
    });

    await queryRunner.manager.save(postAsset);
    return postAsset;
  }

  async findAssetsByPost(postId: string): Promise<PostAsset[]> {
    return await this.postAssetRepository.find({
      where: { post_id: postId },
    });
  }

  async findAssetByName(hashedFileName: string) {
    return await this.postAssetRepository.findOne({
      where: {
        hashed_file_name: hashedFileName,
      },
    });
  }

  async deletePostAsset(assetId: string, queryRunner: QueryRunner) {
    await queryRunner.manager.delete(PostAsset, { id: assetId });
  }
}
