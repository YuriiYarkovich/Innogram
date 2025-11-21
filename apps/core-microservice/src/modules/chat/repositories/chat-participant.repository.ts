import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatParticipant } from '../../../common/entities/chat/chat-participant.entity';
import { QueryRunner, Repository } from 'typeorm';
import { UserRoles } from '../../../common/enums/user-roles.enum';
import { ChatParticipantRole } from '../../../common/enums/chat.enum';

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
  ): Promise<ChatParticipant> {
    const chatParticipant: ChatParticipant = queryRunner.manager.create(
      ChatParticipant,
      {
        profileId: chatParticipantId,
        chatId: chatId,
      },
    );

    await queryRunner.manager.save(chatParticipant);

    return chatParticipant;
  }

  async foundAllChatsOfProfile(profileId: string): Promise<ChatParticipant[]> {
    return await this.chatParticipantRepository.find({
      relations: {
        chat: true,
      },
      where: {
        profileId: profileId,
      },
    });
  }

  async updateRole(
    participantId: string,
    newRole: string,
  ): Promise<ChatParticipant | null> {
    if (
      newRole === (UserRoles.USER as string) ||
      newRole === (UserRoles.ADMIN as string)
    ) {
      await this.chatParticipantRepository.update(
        { id: participantId },
        { role: newRole as ChatParticipantRole },
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
  ): Promise<ChatParticipant | null> {
    if (newRole === 'participant' || newRole === 'admin') {
      await queryRunner.manager.update(
        ChatParticipant,
        { profileId: profileId },
        { role: newRole as ChatParticipantRole },
      );
    } else throw new BadRequestException('There are no such role!');

    return queryRunner.manager.findOne(ChatParticipant, {
      where: { id: profileId },
    });
  }

  async findChatParticipant(
    profileId: string,
    chatId: string,
  ): Promise<ChatParticipant | null> {
    return await this.chatParticipantRepository.findOne({
      where: { profileId: profileId, chatId: chatId },
    });
  }

  async leaveChat(profileId: string, chatId: string) {
    await this.chatParticipantRepository.delete({
      chatId: chatId,
      profileId: profileId,
    });
  }

  async findAllParticipantsOfChat(chatId: string): Promise<ChatParticipant[]> {
    return await this.chatParticipantRepository.find({ where: { chatId } });
  }
}
