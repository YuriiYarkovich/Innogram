import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ChatRepository } from './repositories/chat.repository';
import { CreateChatDto } from './dto/create-chat.dto';
import { DataSource, QueryRunner } from 'typeorm';
import { ChatParticipantRepository } from './repositories/chat-participant.repository';
import { AddParticipantDto } from './dto/add-participant.dto';
import { WrongUserException } from '../../common/exceptions/wrong-user.exception';
import { ChatParticipant } from '../../common/entities/chat/chat-participant.entity';
import { Chat } from '../../common/entities/chat/chat.entity';
import { UserRoles } from '../../common/enums/user-roles.enum';
import {
  FindingChatData,
  ReturningChatData,
} from '../../common/types/chat.types';
import { MessagesRepository } from '../messages/repositories/messages.repository';
import { ProfilesService } from '../profiles/profiles.service';
import { ChatParticipantRole } from '../../common/enums/chat.enum';
import { MinioService } from '../minio/minio.service';

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
  ): Promise<ReturningChatData> {
    const queryRunner: QueryRunner = await this.createTransaction();

    try {
      const createdChat: Chat = await this.chatRepository.createChat(
        dto,
        queryRunner,
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
          );
        }
      }

      const avatarUrl: string | undefined =
        await this.minioService.getPublicUrl(createdChat.chatAvatarFilename);
      const returningChatData: ReturningChatData = {
        ...createdChat,
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

  async getAllChatsOfProfile(profileId: string) {
    const foundChats =
      await this.chatRepository.getAllChatsOfProfile(profileId);
    const returningChatsData: ReturningChatData[] = [];
    for (const chat of foundChats) {
      const lastMessage = await this.messagesRepository.getLastMessageOfChat(
        chat.id,
        profileId,
      );
      console.log(
        `Last message of chat ${chat.id}: ${JSON.stringify(lastMessage)}`,
      );
      const avatarUrl = await this.minioService.getPublicUrl(
        chat.avatarFilename,
      );
      const returningChatData: ReturningChatData = {
        id: chat.id,
        avatarUrl,
        title: chat.title,
        lastMessageContent: lastMessage?.content,
        lastMessageCreatedAt: lastMessage?.createdAt,
        lastMessageRead: lastMessage?.read,
      };
      returningChatsData.push(returningChatData);
    }
    console.log(`Returning chats info: ${JSON.stringify(returningChatsData)}`);
    return returningChatsData;
  }

  async getPrivateChatInfo(currentProfileId: string, receiverId: string) {
    return await this.chatRepository.findPrivateChat(
      currentProfileId,
      receiverId,
    );
  }

  async getChatInfo(
    chatId: string,
    profileId: string,
  ): Promise<ReturningChatData> {
    await this.checkIfParticipantExists(chatId, profileId);
    const chat: FindingChatData | null =
      await this.chatRepository.getChatInfo(chatId);
    if (!chat) throw new BadRequestException(`This chat doesn't exist!`);
    const lastMessage = await this.messagesRepository.getLastMessageOfChat(
      chat.id,
      profileId,
    );

    return {
      ...chat,
      lastMessageContent: lastMessage?.content,
      lastMessageCreatedAt: lastMessage?.createdAt,
      lastMessageRead: lastMessage?.read,
    };
  }

  async updateChatTitle(chatId: string, title: string, profileId: string) {
    const chatParticipant: ChatParticipant =
      await this.checkIfParticipantExists(chatId, profileId);

    if (chatParticipant.role !== ChatParticipantRole.ADMIN)
      throw new ForbiddenException('Participant is not admin of this chat');

    await this.chatRepository.updateChatTitle(chatId, title);
    return await this.chatRepository.getChatInfo(chatId);
  }

  async autoUpdateChatTitle(chatId: string, title: string) {
    await this.chatRepository.updateChatTitle(chatId, title);
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
    profileId: string,
  ) {
    const queryRunner: QueryRunner = await this.createTransaction();
    try {
      await this.checkIfParticipantExists(chatId, profileId);

      //TODO create check if all those users exist
      for (const chatParticipantId of dto.participantsIds) {
        await this.chatParticipantRepository.addChatParticipant(
          chatId,
          chatParticipantId,
          queryRunner,
        );
      }
      await queryRunner.commitTransaction();
      return await this.chatRepository.getChatInfo(chatId);
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  async archiveChat(chatId: string, participantId: string) {
    await this.checkIfParticipantExists(chatId, participantId);

    return await this.chatRepository.archiveChat(chatId);
  }

  async getAllChatParticipants(chatId: string): Promise<ChatParticipant[]> {
    return await this.chatParticipantRepository.findAllParticipantsOfChat(
      chatId,
    );
  }
}
