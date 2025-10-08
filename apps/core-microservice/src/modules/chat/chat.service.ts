import { Injectable } from '@nestjs/common';
import { ChatRepository } from './repositories/chat.repository';
import { CreateChatDto } from './dto/create-chat.dto';
import { DataSource } from 'typeorm';
import { ChatParticipantRepository } from './repositories/chat-participant.repository';

@Injectable()
export class ChatService {
  constructor(
    private chatRepository: ChatRepository,
    private chatParticipantRepository: ChatParticipantRepository,
    private dataSource: DataSource,
  ) {}

  async createChat(dto: CreateChatDto, chatParticipantsIds: string[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const createdChat = await this.chatRepository.createChat(
        dto,
        queryRunner,
      );

      //TODO create check if all those users exist
      for (const chatParticipantId of chatParticipantsIds) {
        await this.chatParticipantRepository.addChatParticipant(
          createdChat.id,
          chatParticipantId,
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
}
