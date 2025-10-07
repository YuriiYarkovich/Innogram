import { BadRequestException, Injectable } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { PostAsset } from '../../common/entities/postsDedicated/post-asset.entity';

@Injectable()
export class PostAssetRepository {
  async addAsset(
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
}
