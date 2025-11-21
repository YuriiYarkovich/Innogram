import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageAsset } from '../../../common/entities/chat/message_asset.entity';
import { QueryRunner, Repository } from 'typeorm';
import { AssetType } from '../../../common/enums/message.enum';

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
  ): Promise<MessageAsset> {
    const createdAsset: MessageAsset = queryRunner.manager.create(
      MessageAsset,
      {
        messageId: messageId,
        type: fileType as AssetType,
        order,
        hashedFileName: fileName,
      },
    );

    await queryRunner.manager.save(createdAsset);

    return createdAsset;
  }

  async deleteMessageAsset(assetId: string, queryRunner: QueryRunner) {
    await queryRunner.manager.delete(MessageAsset, { id: assetId });
  }

  async findAssetByName(filename: string): Promise<MessageAsset | null> {
    return await this.messageAssetRepository.findOne({
      where: { hashedFileName: filename },
    });
  }

  async findAssetsByMessage(messageId: string): Promise<MessageAsset[]> {
    return await this.messageAssetRepository.find({
      where: { messageId: messageId },
    });
  }
}
