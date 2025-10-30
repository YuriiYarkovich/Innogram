import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { Chat } from '../../../common/entities/chat/chat.entity';
import { CreateChatDto } from '../dto/create-chat.dto';
import { ChatStatus, ChatTypes } from '../../../common/enums/chat.enum';

@Injectable()
export class ChatRepository {
  constructor(
    @InjectRepository(Chat) private chatRepository: Repository<Chat>,
  ) {}

  async createChat(
    dto: CreateChatDto,
    queryRunner: QueryRunner,
  ): Promise<Chat> {
    const chat: Chat = queryRunner.manager.create(Chat, {
      title: dto.title,
      description: dto.description,
      chatType: dto.chatType as ChatTypes,
    });
    await queryRunner.manager.save(chat);
    return chat;
  }

  async getChatInfo(chatId: string): Promise<Chat | null> {
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

  async archiveChat(chatId: string): Promise<Chat | null> {
    await this.chatRepository.update(
      { id: chatId },
      { chatStatus: ChatStatus.ARCHIVED },
    );

    return await this.getChatInfo(chatId);
  }
}
