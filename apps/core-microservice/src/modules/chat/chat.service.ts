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

@Injectable()
export class ChatService {
  constructor(
    private chatRepository: ChatRepository,
    private chatParticipantRepository: ChatParticipantRepository,
    private dataSource: DataSource,
  ) {}

  async createTransaction(): Promise<QueryRunner> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    return queryRunner;
  }

  async createChat(dto: CreateChatDto) {
    const queryRunner = await this.createTransaction();

    try {
      const createdChat = await this.chatRepository.createChat(
        dto,
        queryRunner,
      );

      const chatParticipantsIds = dto.participantsIds;
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
          'admin',
          queryRunner,
        );
      }

      await queryRunner.commitTransaction();
      return createdChat;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    }
  }

  async getAllChatsOfProfile(profileId: string) {
    return await this.chatParticipantRepository.foundAllChatsOfProfile(
      profileId,
    );
  }

  async getChatInfo(chatId: string, profileId: string) {
    await this.checkIfParticipantExists(chatId, profileId);
    const chat = await this.chatRepository.getChatInfo(chatId);
    if (!chat) throw new BadRequestException(`This chat doesn't exist!`);
    return chat;
  }

  async updateChatTitle(chatId: string, dto: CreateChatDto, profileId: string) {
    const chatParticipant = await this.checkIfParticipantExists(
      chatId,
      profileId,
    );

    if (chatParticipant.role !== 'admin')
      throw new ForbiddenException('Participant is not admin of this chat');

    await this.chatRepository.updateChat(chatId, dto);
    return await this.chatRepository.getChatInfo(chatId);
  }

  private async checkIfParticipantExists(chatId: string, profileId: string) {
    const participant =
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
    const queryRunner = await this.createTransaction();
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
    }
  }

  async archiveChat(chatId: string, participantId: string) {
    await this.checkIfParticipantExists(chatId, participantId);

    return await this.chatRepository.archiveChat(chatId);
  }
}
