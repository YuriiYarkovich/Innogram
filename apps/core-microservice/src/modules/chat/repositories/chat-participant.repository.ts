import { Injectable } from '@nestjs/common';
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
}
