import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { Chat } from '../../../common/entities/chat/chat.entity';
import { CreateChatDto } from '../dto/create-chat.dto';
import { ChatStatus } from '../../../common/enums/chat.enum';
import { FindingChatData } from '../../../common/types/chat.types';

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
      chatType: dto.chatType,
    });
    await queryRunner.manager.save(chat);
    return chat;
  }

  async findPrivateChat(
    currentProfileId: string,
    receiverId: string,
  ): Promise<{ chatId: string | null }> {
    return await this.chatRepository.query(
      `
      SELECT cp.chat_id
      FROM main.chat_participants cp
      WHERE cp.profile_id IN ($1, $2)
      GROUP BY cp.chat_id
      HAVING COUNT(*) = 2
         AND COUNT(DISTINCT cp.profile_id) = 2;
    `,
      [currentProfileId, receiverId],
    );
  }

  async getAllChatsOfProfile(profileId: string): Promise<FindingChatData[]> {
    return await this.chatRepository.query(
      `
        SELECT chat.id,
               chat.chat_avatar_filename AS "avatarFilename",
               chat.title
        FROM main.chats AS chat
               RIGHT JOIN main.chat_participants AS chatParticipant ON chat.id = chatParticipant.chat_id
        WHERE chatParticipant.profile_id = $1
      `,
      [profileId],
    );
  }

  async getChatInfo(chatId: string): Promise<FindingChatData | null> {
    return await this.chatRepository.query(
      `
      SELECT id,
             chat_avatar_filename AS "avatarFilename",
             title
      FROM main.chats
      WHERE id = $1
    `,
      [chatId],
    );
  }

  async updateChatTitle(chatId: string, newTitle: string) {
    await this.chatRepository.update({ id: chatId }, { title: newTitle });
  }

  async deleteChat(chatId: string) {
    await this.chatRepository.delete({ id: chatId });
  }

  async archiveChat(chatId: string): Promise<FindingChatData | null> {
    await this.chatRepository.update(
      { id: chatId },
      { chatStatus: ChatStatus.ARCHIVED },
    );

    return await this.getChatInfo(chatId);
  }
}
