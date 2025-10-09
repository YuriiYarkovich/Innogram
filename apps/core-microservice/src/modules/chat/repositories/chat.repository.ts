import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { Chat } from '../../../common/entities/chatDedicated/chat.entity';
import { CreateChatDto } from '../dto/create-chat.dto';

@Injectable()
export class ChatRepository {
  constructor(
    @InjectRepository(Chat) private chatRepository: Repository<Chat>,
  ) {}

  async createChat(dto: CreateChatDto, queryRunner: QueryRunner) {
    const chat = queryRunner.manager.create(Chat, { ...dto });
    await queryRunner.manager.save(chat);
    return chat;
  }

  async getChatInfo(chatId: string) {
    return await this.chatRepository.findOne({
      relations: {
        chatParticipants: true,
        messages: true,
      },
      where: { id: chatId },
    });
  }

  async updateChatTitle(chatId: string, title: string) {
    await this.chatRepository.update({ id: chatId }, { title });
  }

  async deleteChat(chatId: string) {
    await this.chatRepository.delete({ id: chatId });
  }
}
