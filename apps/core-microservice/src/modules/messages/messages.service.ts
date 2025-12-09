import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { MessagesRepository } from './repositories/messages.repository';
import { CreateMessageDto } from './dto/create-message.dto';
import { DataSource, QueryRunner } from 'typeorm';
import { PostAsset } from '../../common/entities/posts/post-asset.entity';
import { Message } from '../../common/entities/chat/message.entity';
import { MinioService } from '../minio/minio.service';
import { MessageAssetsRepository } from './repositories/message-assets.repository';
import { ChatParticipantRepository } from '../chat/repositories/chat-participant.repository';
import { File as MulterFile } from 'multer';
import { MessageReceiverRepository } from './repositories/message-receiver.repository';
import {
  FindingMessageData,
  MessageReceiver,
  ReturningMessageData,
} from '../../common/types/message.type';
import { ChatParticipant } from '../../common/entities/chat/chat-participant.entity';
import { EditMessageDto } from './dto/edit-message.dto';
import { MessageAsset } from '../../common/entities/chat/message_asset.entity';

@Injectable()
export class MessagesService {
  constructor(
    private messagesRepository: MessagesRepository,
    private messageReceiverRepository: MessageReceiverRepository,
    private dataSource: DataSource,
    private minioService: MinioService,
    private messagesAssetRepository: MessageAssetsRepository,
    private chatParticipantRepository: ChatParticipantRepository,
  ) {}

  async createTransaction(): Promise<QueryRunner> {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    return queryRunner;
  }

  async createMessage(
    dto: CreateMessageDto,
    currentProfileId: string,
    receiverProfiles: MessageReceiver[],
    files: MulterFile[],
  ) {
    const queryRunner: QueryRunner = await this.createTransaction();

    let fileNotes: { hashedFilename: string; type: string; order: number }[] =
      [];
    try {
      await this.checkIfUserIsChatParticipant(dto.senderId, dto.chatId);

      const createdMessage: Message =
        await this.messagesRepository.createMessage(dto, queryRunner);

      for (const receiver of receiverProfiles) {
        await this.messageReceiverRepository.createMessageReceiver(
          createdMessage.id,
          receiver.profileId,
          receiver.readStatus,
          queryRunner,
        );
      }

      if (files && files.length > 0) {
        const order = 0;
        fileNotes = await this.uploadFilesArray(
          files,
          queryRunner,
          createdMessage,
          order,
        );
      }

      const createdMessageObj = await this.messagesRepository.getMessageById(
        createdMessage.id,
        currentProfileId,
        queryRunner,
      );

      const returningMessageData =
        await this.createReturningMessageFromFindingMessage(createdMessageObj);

      await queryRunner.commitTransaction();

      return returningMessageData;
    } catch (e) {
      if (fileNotes.length > 0)
        await this.deleteFilesOnRollbackTransaction(fileNotes);
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  async createReturningMessageFromFindingMessage(
    createdMessageObj: FindingMessageData,
  ) {
    const authorAvatarUrl = await this.minioService.getPublicUrl(
      createdMessageObj.authorAvatarFilename,
    );

    const messageAssets: { url: string | undefined; order: number }[] = [];
    if (createdMessageObj.assets && createdMessageObj.assets.length > 0) {
      for (const asset of createdMessageObj.assets) {
        const url = await this.minioService.getPublicUrl(asset.filename);
        const messageAsset: { url: string | undefined; order: number } = {
          url,
          order: asset.order,
        };
        messageAssets.push(messageAsset);
      }
    }

    const returningMessageData: ReturningMessageData = {
      ...createdMessageObj,
      messageAssets,
      authorAvatarUrl,
    };

    return returningMessageData;
  }

  async uploadFilesArray(
    files: MulterFile[],
    queryRunner: QueryRunner,
    message: Message,
    order: number,
  ) {
    const filesNotes: {
      hashedFilename: string;
      type: string;
      order: number;
    }[] = [];

    for (const file of files) {
      const fileData: { hashedFileName: string; type: string } =
        await this.minioService.uploadFile(file);
      queryRunner.manager.create(MessageAsset, {
        hashedFileName: fileData.hashedFileName,
      });

      const fileType: string = fileData.type;
      if (fileType !== 'image' && fileType !== 'video') {
        throw new BadRequestException('Invalid type value');
      }

      await this.messagesAssetRepository.createMessageAsset(
        fileData.hashedFileName,
        message.id,
        queryRunner,
        fileType,
        ++order,
      );

      filesNotes.push({
        hashedFilename: fileData.hashedFileName,
        type: fileData.type,
        order,
      });
    }

    return filesNotes;
  }

  async deleteFilesOnRollbackTransaction(
    fileNotes: { hashedFilename: string; type: string; order: number }[],
  ) {
    for (const fileNote of fileNotes) {
      await this.minioService.deleteFile(fileNote.hashedFilename);
    }
  }

  async checkIfUserIsChatParticipant(profileId: string, chatId: string) {
    const chatParticipant: ChatParticipant | null =
      await this.chatParticipantRepository.findChatParticipant(
        profileId,
        chatId,
      );

    if (!chatParticipant)
      throw new BadRequestException(
        'This profile is not a participant of the chat!',
      );
  }

  async getMessagesFromChat(
    currentProfileId: string,
    chatId: string,
    lastLoadedMessageCreatedAt: string,
  ) {
    await this.checkIfUserIsChatParticipant(currentProfileId, chatId);

    const foundMessages: FindingMessageData[] | null =
      await this.messagesRepository.getMessagesFromChat(
        chatId,
        currentProfileId,
        lastLoadedMessageCreatedAt,
      );

    if (!foundMessages) return null;

    const messagesIds: string[] = [];
    foundMessages.forEach((message) => messagesIds.push(message.id));

    await this.messageReceiverRepository.changeStatusToRead(messagesIds);

    const returningMessagesData: ReturningMessageData[] = [];
    for (const message of foundMessages) {
      const returningMessage =
        await this.createReturningMessageFromFindingMessage(message);
      returningMessagesData.push(returningMessage);
    }

    return returningMessagesData;
  }

  async getAllMessageAssetsUrls(messageId: string) {
    const messageAssets =
      await this.messagesAssetRepository.findAssetsByMessage(messageId);
    const messageAssetsUrls: string[] = [];
    for (const messageAsset of messageAssets) {
      const messageAssetUrl = await this.minioService.getPublicUrl(
        messageAsset.hashedFileName,
      );
      if (!messageAssetUrl)
        throw new InternalServerErrorException(
          'Something went wrong while getting url to a message asset',
        );
      messageAssetsUrls.push(messageAssetUrl);
    }
    return messageAssetsUrls;
  }

  async editMessage(
    messageId: string,
    dto: EditMessageDto,
    currentProfileId: string,
    files: MulterFile | undefined = null,
  ) {
    const queryRunner: QueryRunner = await this.createTransaction();

    try {
      await this.checkIfMessageExistsAndProfileIsAuthor(
        messageId,
        currentProfileId,
      );

      const updatedMessage = await this.messagesRepository.updateMessage(
        messageId,
        currentProfileId,
        dto,
        queryRunner,
      );

      if (files) {
        const existingFileNames =
          await this.messagesAssetRepository.findFilenamesOfMessageAssets(
            updatedMessage.id,
          );
        const newFileNames: string[] = files.map(
          (f: MulterFile) => f.originalname,
        );

        const namesToAdd: string[] = newFileNames.filter(
          (name: string): boolean => !existingFileNames.includes(name),
        );
        const namesToRemove: string[] = existingFileNames.filter(
          (name: string): boolean => !newFileNames.includes(name),
        );

        if (namesToRemove.length > 0) {
          for (const fileName of namesToRemove) {
            const asset: MessageAsset | null =
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
          const existingAssets: MessageAsset[] =
            await this.messagesAssetRepository.findAssetsByMessage(messageId);
          let order: number = existingAssets.length;

          const filesToAdd: MulterFile[] = files.filter(
            (f: MulterFile): boolean => namesToAdd.includes(f.originalname),
          );

          for (const file of filesToAdd) {
            const newAsset: { hashedFileName: string; type: string } =
              await this.minioService.uploadFile(file);
            await this.messagesAssetRepository.createMessageAsset(
              newAsset.hashedFileName,
              messageId,
              queryRunner,
              newAsset.type,
              ++order,
            );
          }
        }
      }

      const message = await this.messagesRepository.getMessageById(
        messageId,
        currentProfileId,
        queryRunner,
      );
      await queryRunner.commitTransaction();
      const returningMessage =
        await this.createReturningMessageFromFindingMessage(message);

      return returningMessage;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteMessage(messageId: string) {
    await this.messagesRepository.setDeleteStatusToMessage(messageId);
  }

  private async checkIfMessageExistsAndProfileIsAuthor(
    messageId: string,
    currentProfileId: string,
  ) {
    const message = await this.messagesRepository.findMessageByIdAndAuthor(
      messageId,
      currentProfileId,
    );

    if (!message)
      throw new BadRequestException(
        'There is no message with provided id by provided author',
      );
  }

  async getLastMessageOfChat(chatId: string, currentProfileId: string) {
    return await this.messagesRepository.getLastMessageOfChat(
      chatId,
      currentProfileId,
    );
  }
}
