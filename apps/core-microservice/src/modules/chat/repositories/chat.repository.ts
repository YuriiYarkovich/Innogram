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
    const chat = queryRunner.manager.create(Chat, {
      title: dto.title,
      description: dto.description,
      chat_type: dto.chat_type,
    });
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

  async updateChat(chatId: string, dto: CreateChatDto) {
    await this.chatRepository.update(
      { id: chatId },
      { title: dto.title, description: dto.description },
    );
  }

  async deleteChat(chatId: string) {
    await this.chatRepository.delete({ id: chatId });
  }

  async archiveChat(chatId: string) {
    await this.chatRepository.update(
      { id: chatId },
      { chat_status: 'archived' },
    );

    return await this.getChatInfo(chatId);
  }
}
