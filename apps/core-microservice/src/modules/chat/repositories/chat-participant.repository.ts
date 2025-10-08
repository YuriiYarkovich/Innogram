import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatParticipant } from '../../../common/entities/chatDedicated/chat-participant.entity';
import { QueryRunner, Repository } from 'typeorm';

@Injectable()
export class ChatParticipantRepository {
  constructor(
    @InjectRepository(ChatParticipant)
    private chatParticipantRepository: Repository<ChatParticipant>,
  ) {}

  async addChatParticipant(
    chatId: string,
    chatParticipantId: string,
    queryRunner: QueryRunner,
  ) {
    const chatParticipant = queryRunner.manager.create(ChatParticipant, {
      profile_id: chatParticipantId,
      chat_id: chatId,
    });

    await queryRunner.manager.save(chatParticipant);

    return chatParticipant;
  }

  async foundAllChatsOfProfile(profileId: string) {
    return await this.chatParticipantRepository.find({
      relations: {
        chat: true,
      },
      where: {
        profile_id: profileId,
      },
    });
  }

  async updateRole(participantId: string, newRole: string) {
    if (newRole === 'participant' || newRole === 'admin') {
      await this.chatParticipantRepository.update(
        { id: participantId },
        { role: newRole },
      );
    } else throw new BadRequestException('There are no such role!');

    return this.chatParticipantRepository.findOne({
      where: { id: participantId },
    });
  }

  async updateRoleInTransaction(
    profileId: string,
    newRole: string,
    queryRunner: QueryRunner,
  ) {
    if (newRole === 'participant' || newRole === 'admin') {
      await queryRunner.manager.update(
        ChatParticipant,
        { profile_id: profileId },
        { role: newRole },
      );
    } else throw new BadRequestException('There are no such role!');

    return queryRunner.manager.findOne(ChatParticipant, {
      where: { id: profileId },
    });
  }

  async findChatParticipant(profileId: string, chatId: string) {
    return await this.chatParticipantRepository.findOne({
      where: { profile_id: profileId, chat_id: chatId },
    });
  }

  async leaveChat(profileId: string, chatId: string) {
    await this.chatParticipantRepository.delete({
      chat_id: chatId,
      profile_id: profileId,
    });
  }
}
