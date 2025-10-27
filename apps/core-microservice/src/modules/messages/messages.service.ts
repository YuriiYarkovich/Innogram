import { BadRequestException, Injectable } from '@nestjs/common';
import { MessagesRepository } from './repositories/messages.repository';
import { CreateMessageDto } from './dto/create-message.dto';
import { DataSource, QueryRunner } from 'typeorm';
import { PostAsset } from '../../common/entities/posts/post-asset.entity';
import { Message } from '../../common/entities/chat/message.entity';
import { MinioService } from '../minio/minio.service';
import { MessageAssetsRepository } from './repositories/message-assets.repository';
import { ChatParticipantRepository } from '../chat/repositories/chat-participant.repository';
import { File as MulterFile } from 'multer';
import { EditMessageDto } from './dto/edit-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    private messagesRepository: MessagesRepository,
    private dataSource: DataSource,
    private minioService: MinioService,
    private messagesAssetRepository: MessageAssetsRepository,
    private chatParticipantRepository: ChatParticipantRepository,
  ) {}

  async createTransaction() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    return queryRunner;
  }

  async createMessage(
    dto: CreateMessageDto,
    senderId: string,
    readStatus: boolean,
    files: MulterFile | undefined = null,
  ) {
    const queryRunner = await this.createTransaction();

    try {
      await this.checkIfUserIsChatParticipant(senderId, dto.chatId);

      let createdMessage: Message | undefined = undefined;

      if (!readStatus) {
        createdMessage = await this.messagesRepository.createMessage(
          dto,
          senderId,
          queryRunner,
        );
      } else {
        createdMessage = await this.messagesRepository.createReadMessage(
          dto,
          senderId,
          queryRunner,
        );
      }

      if (files) {
        if (files.length == 0) return createdMessage;

        const order = 0;
        await this.uploadFilesArray(files, queryRunner, createdMessage, order);
      }

      await queryRunner.commitTransaction();

      return createdMessage;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    }
  }

  async uploadFilesArray(
    files,
    queryRunner: QueryRunner,
    message: Message,
    order: number,
  ) {
    for (const file of files) {
      const fileData = await this.minioService.uploadFile(file);
      queryRunner.manager.create(PostAsset, {
        hashed_file_name: fileData.hashedFileName,
      });
      await this.messagesAssetRepository.createMessageAsset(
        fileData.hashedFileName,
        message.id,
        queryRunner,
        fileData.type,
        ++order,
      );
    }
  }

  async checkIfUserIsChatParticipant(profileId: string, chatId: string) {
    const chatParticipant =
      await this.chatParticipantRepository.findChatParticipant(
        profileId,
        chatId,
      );

    if (!chatParticipant)
      throw new BadRequestException(
        'This profile is not a participant of the chat!',
      );
  }

  async getAllMessagesOfChat(profileId: string, chatId: string) {
    await this.checkIfUserIsChatParticipant(profileId, chatId);

    const foundMessages =
      await this.messagesRepository.getAllMessagesOfChat(chatId);

    for (const message of foundMessages) {
      await Promise.all(
        message.assets.map(async (messageAsset) => {
          messageAsset.url = await this.minioService.getPublicUrl(
            messageAsset.hashed_file_name,
          );
        }),
      );
    }

    return foundMessages;
  }

  async checkIfMessageExistsAndProfileIsAuthor(
    messageId: string,
    profileId: string,
  ) {
    const foundMessage =
      await this.messagesRepository.getMessageById(messageId);
    if (!foundMessage)
      throw new BadRequestException('There is no such message!');

    if (foundMessage.sender_id !== profileId)
      throw new BadRequestException('User is not an author of the message!');

    return foundMessage;
  }

  async editMessage(
    messageId: string,
    dto: EditMessageDto,
    profileId: string,
    files: MulterFile[],
  ) {
    const queryRunner = await this.createTransaction();

    try {
      await this.checkIfMessageExistsAndProfileIsAuthor(messageId, profileId);

      const updatedMessage = await this.messagesRepository.updateMessage(
        messageId,
        dto,
        queryRunner,
      );

      const existingFileNames =
        updatedMessage?.assets?.map((a) => a.hashed_file_name) ?? [];
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
            await this.messagesAssetRepository.findAssetByName(fileName);
          if (!asset) continue;

          await this.messagesAssetRepository.deleteMessageAsset(
            asset.id,
            queryRunner,
          );
          await this.minioService.deleteFile(fileName);
        }
      }

      if (namesToAdd.length > 0) {
        const existingAssets =
          await this.messagesAssetRepository.findAssetsByMessage(messageId);
        let order = existingAssets.length;

        const filesToAdd = files.filter((f) =>
          namesToAdd.includes(f.originalname),
        );

        for (const file of filesToAdd) {
          const newAsset = await this.minioService.uploadFile(file);
          await this.messagesAssetRepository.createMessageAsset(
            newAsset.hashedFileName,
            messageId,
            queryRunner,
            newAsset.type,
            ++order,
          );
        }
      }

      await queryRunner.commitTransaction();
      return await this.messagesRepository.getMessageById(messageId);
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    }
  }

  async deleteMessage(messageId: string, profileId: string) {
    const messageToDelete = await this.checkIfMessageExistsAndProfileIsAuthor(
      messageId,
      profileId,
    );
    await this.messagesRepository.deleteMessage(messageId);
    return messageToDelete;
  }
}
