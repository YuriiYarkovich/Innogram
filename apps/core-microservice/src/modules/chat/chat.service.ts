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
import { Chat } from '../../common/entities/chat/chat.entity';
import { UserRoles } from '../../common/enums/user-roles.enum';

@Injectable()
export class ChatService {
  constructor(
    private chatRepository: ChatRepository,
    private chatParticipantRepository: ChatParticipantRepository,
    private dataSource: DataSource,
  ) {}

  async createTransaction(): Promise<QueryRunner> {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    return queryRunner;
  }

  async createChat(dto: CreateChatDto): Promise<Chat> {
    const queryRunner: QueryRunner = await this.createTransaction();

    try {
      const createdChat: Chat = await this.chatRepository.createChat(
        dto,
        queryRunner,
      );

      const chatParticipantsIds: string[] = dto.participantsIds;
      //TODO create check if all those users exist
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
      }

      await queryRunner.commitTransaction();
      return createdChat;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  async getAllChatsOfProfile(profileId: string): Promise<ChatParticipant[]> {
    return await this.chatParticipantRepository.foundAllChatsOfProfile(
      profileId,
    );
  }

  async getChatInfo(chatId: string, profileId: string): Promise<Chat> {
    await this.checkIfParticipantExists(chatId, profileId);
    const chat: Chat | null = await this.chatRepository.getChatInfo(chatId);
    if (!chat) throw new BadRequestException(`This chat doesn't exist!`);
    return chat;
  }

  async updateChatTitle(
    chatId: string,
    dto: CreateChatDto,
    profileId: string,
  ): Promise<Chat | null> {
    const chatParticipant: ChatParticipant =
      await this.checkIfParticipantExists(chatId, profileId);

    if (chatParticipant.role !== 'admin')
      throw new ForbiddenException('Participant is not admin of this chat');

    await this.chatRepository.updateChat(chatId, dto);
    return await this.chatRepository.getChatInfo(chatId);
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
  ): Promise<Chat | null> {
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

  async archiveChat(
    chatId: string,
    participantId: string,
  ): Promise<Chat | null> {
    await this.checkIfParticipantExists(chatId, participantId);

    return await this.chatRepository.archiveChat(chatId);
  }

  async getAllChatParticipants(chatId: string): Promise<ChatParticipant[]> {
    return await this.chatParticipantRepository.findAllParticipantsOfChat(
      chatId,
    );
  }
}
