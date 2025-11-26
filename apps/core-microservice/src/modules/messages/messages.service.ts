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
import { EditMessageDto } from './dto/edit-message.dto';
import { MessageReceiverRepository } from './repositories/message-receiver.repository';
import {
  FindingMessageData,
  MessageReceiverStatus,
  MessageToEmitToEnteredUser,
  ReturningMessageData,
} from '../../common/types/message.type';
import { MessageAsset } from '../../common/entities/chat/message_asset.entity';
import { ChatParticipant } from '../../common/entities/chat/chat-participant.entity';

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
    receiverProfiles: MessageReceiverStatus[],
    files: MulterFile | undefined = null,
  ): Promise<Message> {
    const queryRunner: QueryRunner = await this.createTransaction();

    try {
      await this.checkIfUserIsChatParticipant(dto.senderId, dto.chatId);

      const createdMessage: Message =
        await this.messagesRepository.createMessage(dto, queryRunner);

      for (const receiverId of receiverProfiles) {
        if (!receiverId.readStatus) {
          await this.messageReceiverRepository.createMessageReceiver(
            createdMessage.id,
            receiverId.receiverId,
            queryRunner,
          );
        } else {
          await this.messageReceiverRepository.createReadMessageReceiver(
            createdMessage.id,
            receiverId.receiverId,
            queryRunner,
          );
        }
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
    } finally {
      await queryRunner.release();
    }
  }

  async uploadFilesArray(
    files: MulterFile[],
    queryRunner: QueryRunner,
    message: Message,
    order: number,
  ) {
    for (const file of files) {
      const fileData: { hashedFileName: string; type: string } =
        await this.minioService.uploadFile(file);
      queryRunner.manager.create(PostAsset, {
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
    profileId: string,
    chatId: string,
    lastLoadedMessageCreatedAt: string,
  ) {
    await this.checkIfUserIsChatParticipant(profileId, chatId);

    const foundMessages: FindingMessageData[] | null =
      await this.messagesRepository.getMessagesFromChat(
        chatId,
        lastLoadedMessageCreatedAt,
      );

    if (!foundMessages) return null;

    const returningMessagesData: ReturningMessageData[] = [];
    for (const message of foundMessages) {
      const messageAssets =
        await this.messagesAssetRepository.findAssetsByMessage(message.id);

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

      const authorAvatarUrl = await this.minioService.getPublicUrl(
        message?.authorAvatarFilename,
      );
      const returningMessage: ReturningMessageData = {
        ...message,
        authorAvatarUrl,
        messageAssetsUrls,
      };
      returningMessagesData.push(returningMessage);
    }

    return returningMessagesData;
  }

  async checkIfMessageExistsAndProfileIsAuthor(
    messageId: string,
    profileId: string,
  ): Promise<Message> {
    const foundMessage: Message | null =
      await this.messagesRepository.getMessageById(messageId);
    if (!foundMessage)
      throw new BadRequestException('There is no such message!');

    if (foundMessage.senderId !== profileId)
      throw new BadRequestException('User is not an author of the message!');

    return foundMessage;
  }

  async editMessage(
    messageId: string,
    dto: EditMessageDto,
    profileId: string,
    files: MulterFile | undefined = null,
  ): Promise<Message | null> {
    const queryRunner: QueryRunner = await this.createTransaction();

    try {
      await this.checkIfMessageExistsAndProfileIsAuthor(messageId, profileId);

      const updatedMessage: Message | null =
        await this.messagesRepository.updateMessage(
          messageId,
          dto,
          queryRunner,
        );

      if (files) {
        const existingFileNames: string[] =
          updatedMessage?.assets?.map(
            (a: MessageAsset): string => a.hashedFileName,
          ) ?? [];
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

      await queryRunner.commitTransaction();
      return await this.messagesRepository.getMessageById(messageId);
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
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

  async getAllUnreadMessagesOfProfile(
    receiverProfileId: string,
  ): Promise<MessageToEmitToEnteredUser[]> {
    const messageIds: string[] =
      await this.messageReceiverRepository.getUnreadMessagesIdsOfProfile(
        receiverProfileId,
      );

    const foundMessages: MessageToEmitToEnteredUser[] = [];

    for (const messageId of messageIds) {
      const message: Message | null =
        await this.messagesRepository.getMessageById(messageId);

      if (!message) continue;

      const messageToEmit: MessageToEmitToEnteredUser = {
        messageId,
        content: message.content,
        chatId: message.chatId,
        replyMessageId: message.replyToMessageId,
      };

      foundMessages.push(messageToEmit);
    }

    return foundMessages;
  }

  async updateReadStatusOfMessages(messages: MessageToEmitToEnteredUser[]) {
    for (const message of messages) {
      await this.messageReceiverRepository.updateReadStatus(message.messageId);
    }
  }
}
