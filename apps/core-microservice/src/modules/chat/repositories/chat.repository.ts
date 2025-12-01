import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { Chat } from '../../../common/entities/chat/chat.entity';
import { CreateChatDto } from '../dto/create-chat.dto';
import { ChatStatus, ChatTypes } from '../../../common/enums/chat.enum';
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

  async getPrivateChatByTwoProfiles(
    currentUserId: string,
    secondParticipantId: string,
  ) {
    const rows:
      | { id: string; chatAvatarFilename: string; title: string }[]
      | undefined = await this.chatRepository.query(
      `
      SELECT id, chat_avatar_filename AS "chatAvatarFilename"
      FROM main.chats AS chat
      WHERE chat_status = $1
        AND (SELECT COUNT(*) FROM main.chat_participants WHERE profile_id IN ($3, $4)) = 2
        AND chat_type = $2
    `,
      [
        ChatStatus.ACTIVE,
        ChatTypes.PRIVATE,
        currentUserId,
        secondParticipantId,
      ],
    );

    if (rows) return rows[0];
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
