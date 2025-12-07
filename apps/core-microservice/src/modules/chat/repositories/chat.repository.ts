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
    chatAvatarFilename?: string,
  ): Promise<Chat> {
    const chat: Chat = queryRunner.manager.create(Chat, {
      title: dto.title,
      chatType: dto.chatType,
      chatAvatarFilename,
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
        SELECT id, chat_avatar_filename AS "chatAvatarFilename", chat_type AS "chatType"
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

  async getAllChatsOfProfile(
    profileId: string,
    currentProfileId: string,
  ): Promise<FindingChatData[]> {
    return await this.chatRepository.query(
      `
        SELECT chat.id,
               chat.chat_avatar_filename    AS "avatarFilename",
               chat.title,
               chat.chat_status             AS "chatStatus",
               chat.chat_type               AS "type",
               (SELECT COUNT(*)
                FROM main.chat_participants AS cp
                WHERE cp.chat_id = chat.id) AS "participantsAmount",
               CASE
                 WHEN cpCurrent.role = 'admin' THEN true
                 ELSE false
                 END                        AS "isCurrentUserAdmin"
        FROM main.chats AS chat
               RIGHT JOIN main.chat_participants AS chatParticipant
                          ON chat.id = chatParticipant.chat_id
               LEFT JOIN main.chat_participants AS cpCurrent
                         ON chat.id = cpCurrent.chat_id
                           AND cpCurrent.profile_id = $4
        WHERE chatParticipant.profile_id = $1
          AND chat_status IN ($2, $3)
      `,
      [profileId, ChatStatus.ACTIVE, ChatStatus.ARCHIVED, currentProfileId],
    );
  }

  async getChatInfo(
    chatId: string,
    currentProfileId: string,
  ): Promise<FindingChatData | null> {
    const rows: FindingChatData[] = await this.chatRepository.query(
      `
        SELECT chat.id,
               chat_avatar_filename AS "avatarFilename",
               title,
               chat_status          AS "chatStatus",
               chat.chat_type       AS "type",
               CASE
                 WHEN cp.role = 'ADMIN' THEN true
                 ELSE false
                 END                AS "isCurrentUserAdmin"
        FROM main.chats AS chat
               LEFT JOIN main.chat_participants AS cp
                         ON cp.chat_id = chat.id
                           AND cp.profile_id = $4
        WHERE chat.id = $1
          AND chat_status IN ($2, $3)
      `,
      [chatId, ChatStatus.ACTIVE, ChatStatus.ARCHIVED, currentProfileId],
    );

    return rows[0];
  }

  async updateChatTitle(chatId: string, newTitle: string) {
    await this.chatRepository.update({ id: chatId }, { title: newTitle });
  }

  async deleteChat(chatId: string, queryRunner: QueryRunner) {
    await queryRunner.manager.update(
      Chat,
      { id: chatId },
      { chatStatus: ChatStatus.DELETED, deletedAt: new Date() },
    );
  }

  /*async archiveChat(chatId: string): Promise<FindingChatData | null> {
    await this.chatRepository.update(
      { id: chatId },
      { chatStatus: ChatStatus.ARCHIVED },
    );

    return await this.getChatInfo(chatId);
  }*/
}
