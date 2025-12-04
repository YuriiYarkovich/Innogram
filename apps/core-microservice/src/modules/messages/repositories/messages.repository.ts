import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from '../../../common/entities/chat/message.entity';
import { QueryRunner, Repository } from 'typeorm';
import { CreateMessageDto } from '../dto/create-message.dto';
import {
  MessageReadStatus,
  MessageVisibilityStatus,
} from '../../../common/enums/message.enum';
import { FindingMessageData } from '../../../common/types/message.type';

@Injectable()
export class MessagesRepository {
  constructor(
    @InjectRepository(Message) private messageRepository: Repository<Message>,
  ) {}

  async createMessage(
    dto: CreateMessageDto,
    queryRunner: QueryRunner,
  ): Promise<Message> {
    const createdMessage: Message = queryRunner.manager.create(Message, {
      ...dto,
    });

    await queryRunner.manager.save(createdMessage);

    return createdMessage;
  }

  async getMessagesFromChat(
    chatId: string,
    currentProfileId: string,
    lastLoadedMessageCreatedAt: string,
  ): Promise<FindingMessageData[] | null> {
    return await this.messageRepository.query(
      `
        SELECT *
        FROM (SELECT message.id,
                     message.chat_id                            AS "chatId",
                     (SELECT json_build_object('id', m.id, 'chatId', m.chat_id, 'authorUsername', p.username, 'content',
                                               m.content, 'visibleStatus', m.visible_status)
                      FROM main.messages m
                             LEFT JOIN main.profiles p ON p.id = m.sender_id
                      WHERE m.id = message.reply_to_message_id) AS "replyingMessage",
                     profile.username                           AS "authorUsername",
                     profile.avatar_filename                    AS "authorAvatarFilename",
                     message.content,
                     message.created_at                         AS "createdAt",
                     CASE
                       WHEN messages_receiver.receiver_id = $2
                         THEN messages_receiver.read_status
                       ELSE 'read'
                       END                                      AS "read"
              FROM main.messages AS message
                     LEFT JOIN main.profiles AS profile ON profile.id = message.sender_id
                     LEFT JOIN main.messages_receiver AS messages_receiver
                               ON messages_receiver.message_id = message.id
                                 AND messages_receiver.receiver_id = $2
              WHERE message.chat_id = $1
                AND message.created_at > $3
                AND message.visible_status IN ($4, $5)
              ORDER BY message.created_at DESC
              LIMIT 10) sub
        ORDER BY "createdAt"
      `,
      [
        chatId,
        currentProfileId,
        lastLoadedMessageCreatedAt,
        MessageVisibilityStatus.ACTIVE,
        MessageVisibilityStatus.EDITED,
      ],
    );
  }

  async getLastMessageOfChat(
    chatId: string,
    currentProfileId: string,
  ): Promise<{
    content: string;
    createdAt: string;
    read: MessageReadStatus;
  } | null> {
    const rows: {
      content: string;
      createdAt: string;
      read: MessageReadStatus;
    }[] = await this.messageRepository.query(
      `
        SELECT message.content,
               message.created_at AS "createdAt",
               CASE
                 WHEN messages_receiver.receiver_id = $2
                   THEN messages_receiver.read_status
                 ELSE 'read'
                 END              AS "read"
        FROM main.messages AS message
               LEFT JOIN main.messages_receiver AS messages_receiver
                         ON messages_receiver.message_id = message.id
                           AND messages_receiver.receiver_id = $2
        WHERE message.chat_id = $1
          AND message.visible_status IN ($3, $4)
        ORDER BY message.created_at DESC
        LIMIT 1
      `,
      [
        chatId,
        currentProfileId,
        MessageVisibilityStatus.ACTIVE,
        MessageVisibilityStatus.EDITED,
      ],
    );

    return rows[0] ?? null;
  }

  async getMessageById(messageId: string, currentProfileId: string) {
    const rows: FindingMessageData[] = await this.messageRepository.query(
      `
        SELECT message.id,
               (SELECT json_build_object('id', m.id, 'chatId', m.chat_id, 'authorUsername', p.username, 'content',
                                         m.content)
                FROM main.messages m
                       LEFT JOIN main.profiles p ON p.id = m.sender_id
                WHERE m.id = message.reply_to_message_id) AS "replyingMessage",
               chat_id                                    AS "chatId",
               profile.username                           AS "authorUsername",
               profile.avatar_filename                    AS "authorAvatarFilename",
               content,
               message.created_at                         AS "createdAt",
               CASE
                 WHEN messages_receiver.receiver_id = $2
                   THEN messages_receiver.read_status
                 ELSE 'read'
                 END                                      AS "read"
        FROM main.messages AS message
               LEFT JOIN main.profiles AS profile ON message.sender_id = profile.id
               LEFT JOIN main.messages_receiver AS messages_receiver
                         ON messages_receiver.message_id = message.id
                           AND messages_receiver.receiver_id = $2
        WHERE message.id = $1
        LIMIT 1
      `,
      [messageId, currentProfileId],
    );

    return rows[0];
  }

  /*async updateMessage(
    messageId: string,
    dto: EditMessageDto,
    queryRunner: QueryRunner,
  ) {
    await queryRunner.manager.update(
      Message,
      { id: messageId },
      { content: dto.content, visibleStatus: MessageVisibilityStatus.EDITED },
    );
    return await this.getMessageById(messageId);
  }*/

  async setDeleteStatusToMessage(messageId: string) {
    await this.messageRepository.update(
      { id: messageId },
      {
        visibleStatus: MessageVisibilityStatus.DELETED,
        deleted_at: new Date(),
      },
    );
  }

  async setDeleteStatusToMessagesOfChat(
    chatId: string,
    queryRunner: QueryRunner,
  ) {
    await queryRunner.manager.update(
      Message,
      { chatId },
      {
        visibleStatus: MessageVisibilityStatus.DELETED,
        deleted_at: new Date(),
      },
    );
  }
}
