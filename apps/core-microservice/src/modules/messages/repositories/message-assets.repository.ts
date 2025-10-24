import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageAsset } from '../../../common/entities/chat/message_asset.entity';
import { QueryRunner, Repository } from 'typeorm';

@Injectable()
export class MessageAssetsRepository {
  constructor(
    @InjectRepository(MessageAsset)
    private messageAssetRepository: Repository<MessageAsset>,
  ) {}

  async createMessageAsset(
    fileName: string,
    messageId: string,
    queryRunner: QueryRunner,
    fileType: string,
    order: number,
  ) {
    if (fileType !== 'image' && fileType !== 'video') {
      throw new BadRequestException('Invalid type value');
    }

    const createdAsset = queryRunner.manager.create(MessageAsset, {
      message_id: messageId,
      type: fileType,
      order,
      hashed_file_name: fileName,
    });

    await queryRunner.manager.save(createdAsset);

    return createdAsset;
  }

  async deleteMessageAsset(assetId: string, queryRunner: QueryRunner) {
    await queryRunner.manager.delete(MessageAsset, { id: assetId });
  }

  async findAssetByName(filename: string) {
    return await this.messageAssetRepository.findOne({
      where: { hashed_file_name: filename },
    });
  }

  async findAssetsByMessage(messageId: string) {
    return await this.messageAssetRepository.find({
      where: { message_id: messageId },
    });
  }
}
