import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ChatRepository } from './repositories/chat.repository';
import { CreateChatDto } from './dto/create-chat.dto';
import { DataSource, QueryRunner } from 'typeorm';
import { ChatParticipantRepository } from './repositories/chat-participant.repository';
import { AddParticipantDto } from './dto/add-participant.dto';
import { WrongUserException } from '../../common/exceptions/wrong-user.exception';
import { ChatParticipant } from '../../common/entities/chat/chat-participant.entity';
import { UserRoles } from '../../common/enums/user-roles.enum';
import {
  FindingChatData,
  ReturningChatData,
} from '../../common/types/chat.types';
import { MessagesRepository } from '../messages/repositories/messages.repository';
import { ProfilesService } from '../profiles/profiles.service';
import { ChatParticipantRole } from '../../common/enums/chat.enum';
import { MinioService } from '../minio/minio.service';
import { File as MulterFile } from 'multer';
import { ChatParticipantProfile } from '../../common/types/profile.type';

@Injectable()
export class ChatService {
  constructor(
    private chatRepository: ChatRepository,
    private chatParticipantRepository: ChatParticipantRepository,
    private messagesRepository: MessagesRepository,
    private dataSource: DataSource,
    private profilesService: ProfilesService,
    private minioService: MinioService,
  ) {}

  async createTransaction(): Promise<QueryRunner> {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    return queryRunner;
  }

  async createChat(
    dto: CreateChatDto,
    currentProfileId: string,
    file?: MulterFile,
  ): Promise<ReturningChatData> {
    const queryRunner: QueryRunner = await this.createTransaction();

    let chatAvatarFilename = '';

    if (file) {
      const fileObj = await this.minioService.uploadFile(file);
      chatAvatarFilename = fileObj.hashedFileName;
    }

    try {
      const createdChat = await this.chatRepository.createChat(
        dto,
        queryRunner,
        chatAvatarFilename,
      );

      const chatParticipantsIds: string[] = dto.otherParticipantsIds;
      chatParticipantsIds.unshift(currentProfileId);
      const profiles =
        await this.profilesService.checkIfProfilesExists(chatParticipantsIds);

      if (profiles.length !== chatParticipantsIds.length)
        throw new BadRequestException(
          `One or many participants' ids are wrong`,
        );

      for (const chatParticipantId of chatParticipantsIds) {
        await this.chatParticipantRepository.addChatParticipant(
          createdChat.id,
          chatParticipantId,
          queryRunner,
        );
      }

      if (chatParticipantsIds.length > 2) {
        await this.chatParticipantRepository.updateRoleInTransaction(
          chatParticipantsIds[0],
          UserRoles.ADMIN,
          queryRunner,
        );
        if (!dto.title) {
          await this.autoUpdateChatTitle(
            createdChat.id,
            `${profiles[0].username}, ${profiles[1].username} and others`,
            queryRunner,
          );
        }
      }

      const avatarUrl: string | undefined =
        await this.minioService.getPublicUrl(createdChat.chatAvatarFilename);
      const returningChatData: ReturningChatData = {
        ...createdChat,
        type: createdChat.chatType,
        avatarUrl,
      };

      await queryRunner.commitTransaction();
      return returningChatData;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  private async getAdditionalInfoForPrivateChat(
    chat: FindingChatData,
    currentProfileId: string,
  ): Promise<{ avatarUrl: string | undefined; chatTitle: string }> {
    let avatarUrl = await this.minioService.getPublicUrl(chat.avatarFilename);
    let chatTitle: string = '';
    if (!chat.title && !avatarUrl) {
      const receiver =
        await this.chatParticipantRepository.getSecondParticipantOfPrivateChat(
          chat.id,
          currentProfileId,
        );
      avatarUrl = await this.minioService.getPublicUrl(receiver.avatarFilename);
      chatTitle = receiver.username;
    }
    return { avatarUrl, chatTitle };
  }

  async getPrivateChatByIds(
    currentUserId: string,
    secondParticipantId: string,
  ) {
    const chat = await this.chatRepository.getPrivateChatByTwoProfiles(
      currentUserId,
      secondParticipantId,
    );
    if (!chat) return null;
    const chatParticipants =
      await this.chatParticipantRepository.findAllParticipantsOfChat(chat.id);
    for (const cp of chatParticipants) {
      if (cp.profileId === secondParticipantId) {
        chat.title = cp.username;
      }
    }
    return chat;
  }

  async getAllChatsOfProfile(currentProfileId: string) {
    const foundChats = await this.chatRepository.getAllChatsOfProfile(
      currentProfileId,
      currentProfileId,
    ); //TODO add possibility to get the other accounts chat list

    const returningChatsData: ReturningChatData[] = [];
    for (const chat of foundChats) {
      const lastMessage = await this.messagesRepository.getLastMessageOfChat(
        chat.id,
        currentProfileId,
      );

      const additionalInfo = await this.getAdditionalInfoForPrivateChat(
        chat,
        currentProfileId,
      );

      const returningChatData: ReturningChatData = {
        id: chat.id,
        avatarUrl: additionalInfo.avatarUrl,
        title: chat.title || additionalInfo.chatTitle,
        type: chat.type,
        participantsAmount: chat.participantsAmount,
        isCurrentUserAdmin: chat.isCurrentUserAdmin,
        lastMessageId: lastMessage?.id,
        lastMessageContent: lastMessage?.content,
        lastMessageCreatedAt: lastMessage?.createdAt,
        lastMessageRead: lastMessage?.read,
        chatStatus: chat.chatStatus,
      };
      returningChatsData.push(returningChatData);
    }

    return returningChatsData;
  }

  async getPrivateChatInfo(currentProfileId: string, receiverId: string) {
    return await this.chatRepository.getPrivateChatByTwoProfiles(
      currentProfileId,
      receiverId,
    );
  }

  async getChatInfo(
    chatId: string,
    currentProfileId: string,
  ): Promise<ReturningChatData> {
    await this.checkIfParticipantExists(chatId, currentProfileId);
    const chat: FindingChatData | null = await this.chatRepository.getChatInfo(
      chatId,
      currentProfileId,
    );
    if (!chat) throw new BadRequestException(`This chat doesn't exist!`);
    const lastMessage = await this.messagesRepository.getLastMessageOfChat(
      chat.id,
      currentProfileId,
    );

    const additionalInfo = await this.getAdditionalInfoForPrivateChat(
      chat,
      currentProfileId,
    );

    return {
      id: chat.id,
      avatarUrl: additionalInfo.avatarUrl,
      title: chat.title || additionalInfo.chatTitle,
      type: chat.type,
      participantsAmount: chat.participantsAmount,
      isCurrentUserAdmin: chat.isCurrentUserAdmin,
      lastMessageId: lastMessage?.id,
      lastMessageContent: lastMessage?.content,
      lastMessageCreatedAt: lastMessage?.createdAt,
      lastMessageRead: lastMessage?.read,
      chatStatus: chat.chatStatus,
    };
  }

  async updateChatTitle(
    chatId: string,
    title: string,
    currentProfileId: string,
    file?: MulterFile,
  ) {
    const chatParticipant: ChatParticipant =
      await this.checkIfParticipantExists(chatId, currentProfileId);

    if (chatParticipant.role !== ChatParticipantRole.ADMIN)
      throw new ForbiddenException('Participant is not admin of this chat');

    const queryRunner = await this.createTransaction();

    try {
      await this.chatRepository.updateChatTitle(chatId, title, queryRunner);
      if (file) {
        const editingChat = await this.chatRepository.getChatInfo(
          chatId,
          currentProfileId,
        );
        if (editingChat?.avatarFilename) {
          await this.minioService.deleteFile(editingChat?.avatarFilename);
          const newFileObj = await this.minioService.uploadFile(file);
          await this.chatRepository.updateChatAvatarFilename(
            editingChat.id,
            newFileObj.hashedFileName,
            queryRunner,
          );
        }
      }
      await queryRunner.commitTransaction();
      return await this.chatRepository.getChatInfo(chatId, currentProfileId);
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  async autoUpdateChatTitle(
    chatId: string,
    title: string,
    queryRunner: QueryRunner,
  ) {
    await this.chatRepository.updateChatTitle(chatId, title, queryRunner);
  }

  private async checkIfParticipantExists(
    chatId: string,
    profileId: string,
  ): Promise<ChatParticipant> {
    const participant: ChatParticipant | null =
      await this.chatParticipantRepository.findChatParticipant(
        profileId,
        chatId,
      );

    if (!participant)
      throw new WrongUserException('Chat has no such participant!');

    return participant;
  }

  async leaveChat(chatId: string, profileId: string) {
    await this.checkIfParticipantExists(chatId, profileId);

    return await this.chatParticipantRepository.leaveChat(chatId, profileId);
  }

  async addChatParticipants(
    chatId: string,
    dto: AddParticipantDto,
    currentProfileId: string,
  ) {
    const queryRunner: QueryRunner = await this.createTransaction();
    try {
      await this.checkIfParticipantExists(chatId, currentProfileId);

      //TODO create check if all those users exist
      for (const chatParticipantId of dto.participantsIds) {
        await this.chatParticipantRepository.addChatParticipant(
          chatId,
          chatParticipantId,
          queryRunner,
        );
      }
      await queryRunner.commitTransaction();
      return await this.chatRepository.getChatInfo(chatId, currentProfileId);
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  /*async archiveChat(chatId: string, participantId: string) {
    await this.checkIfParticipantExists(chatId, participantId);

    return await this.chatRepository.archiveChat(chatId);
  }*/

  async getAllChatParticipants(chatId: string) {
    const foundChatParticipants =
      await this.chatParticipantRepository.findAllParticipantsOfChat(chatId);

    const returningChatParticipants: ChatParticipantProfile[] = [];
    for (const chatParticipant of foundChatParticipants) {
      const avatarUrl = await this.minioService.getPublicUrl(
        chatParticipant.avatarFilename,
      );

      returningChatParticipants.push({
        ...chatParticipant,
        avatarUrl,
      });
    }
    return returningChatParticipants;
  }

  async deleteChat(chatId: string, currentProfileId: string) {
    const chat = await this.chatRepository.getChatInfo(
      chatId,
      currentProfileId,
    );
    if (!chat)
      throw new BadRequestException('Chat with provided id does not exist');

    const queryRunner = await this.createTransaction();
    try {
      await this.chatRepository.deleteChat(chatId, queryRunner);
      await this.messagesRepository.setDeleteStatusToMessagesOfChat(
        chatId,
        queryRunner,
      );
      await queryRunner.commitTransaction();
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }
}
