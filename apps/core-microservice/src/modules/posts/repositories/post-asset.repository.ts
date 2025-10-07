import { BadRequestException, Injectable } from '@nestjs/common';
import { QueryRunner, Repository } from 'typeorm';
import { PostAsset } from '../../../common/entities/postsDedicated/post-asset.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PostAssetRepository {
  constructor(
    @InjectRepository(PostAsset)
    private postAssetRepository: Repository<PostAsset>,
  ) {}

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

  async foundAssetsOfPost(postId: string): Promise<PostAsset[]> {
    return await this.postAssetRepository.find({
      where: { post_id: postId },
    });
  }
}
