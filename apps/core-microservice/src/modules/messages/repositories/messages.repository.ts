import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from '../../../common/entities/chat/message.entity';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { CreateMessageDto } from '../dto/create-message.dto';
import { EditMessageDto } from '../dto/edit-message.dto';
import {
  MessageReadStatus,
  MessageVisibilityStatus,
} from '../../../common/enums/message.enum';
import { FindingMessageData } from '../../../common/types/message.type';

@Injectable()
export class MessagesRepository {
  constructor(
    @InjectRepository(Message) private messageRepository: Repository<Message>,
    private dataSource: DataSource,
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
    lastLoadedMessageCreatedAt: string,
  ): Promise<FindingMessageData[] | null> {
    return await this.messageRepository.query(
      `
        SELECT message.id,
               message.chat_id             AS "chatId",
               message.reply_to_message_id AS "respondingMessageId",
               profile.username            AS "authorUsername",
               profile.avatar_filename     AS "authorAvatarFilename",
               message.content,
               message.created_at          AS "createdAt"
        FROM main.messages AS message
               LEFT JOIN main.profiles AS profile ON profile.id = message.sender_id
        WHERE message.chat_id = $1
          AND message.created_at > $2
          AND message.visible_status IN ($3, $4)
        ORDER BY message.created_at
        LIMIT 10
      `,
      [
        chatId,
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
    const rows = await this.messageRepository.query(
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
        WHERE message.chat_id = $1
        ORDER BY message.created_at DESC 
        LIMIT 1
      `,
      [chatId, currentProfileId],
    );

    return rows[0] ?? null;
  }

  async getMessageById(messageId: string) {
    const rows = await this.messageRepository.query(
      `
        SELECT message.id,
               message.reply_to_message_id AS "respondingMessageId",
               chat_id                     AS "chatId",
               profile.username            AS "authorUsername",
               profile.avatar_filename     AS "authorAvatarFilename",
               content,
               message.created_at          AS "createdAt"
        FROM main.messages AS message
               LEFT JOIN main.profiles AS profile ON message.sender_id = profile.id
        WHERE message.id = $1
        LIMIT 1
      `,
      [messageId],
    );

    const foundMessage: FindingMessageData = rows[0];
    return foundMessage;
  }

  async updateMessage(
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
  }

  async deleteMessage(messageId: string) {
    await this.messageRepository.update(
      { id: messageId },
      { visibleStatus: MessageVisibilityStatus.DELETED },
    );
  }
}
