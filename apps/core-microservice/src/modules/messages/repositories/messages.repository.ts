import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from '../../../common/entities/chat/message.entity';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { CreateMessageDto } from '../dto/create-message.dto';
import { EditMessageDto } from '../dto/edit-message.dto';
import { MessageVisibilityStatus } from '../../../common/enums/message.enum';
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
               message.chat_id         AS "chatId",
               profile.username        AS "authorUsername",
               profile.avatar_filename AS "authorAvatarFilename",
               message.content,
               message.created_at      AS "createdAt"
        FROM main.messages AS message
               LEFT JOIN main.profiles AS profile ON profile.id = message.sender_id
        WHERE message.chat_id = $1
          AND message.created_at > $2
          AND message.visible_status IN ($3, $4)
        ORDER BY message.created_at DESC
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
    currentUserId: string,
  ): Promise<{ content: string; createdAt: string; read: boolean }> {
    return await this.messageRepository.query(
      `
        SELECT message.content,
               message.created_at            AS "createdAt",
               messages_receiver.read_status AS "read"
        FROM main.messages AS message
               LEFT JOIN main.messages_receiver AS messages_receiver ON messages_receiver.receiver_id = $2
        WHERE message.chat_id = $1
        ORDER BY message.created_at
        LIMIT 1
      `,
      [chatId, currentUserId],
    );
  }

  async getMessageById(messageId: string): Promise<Message | null> {
    return await this.messageRepository.findOne({
      relations: { assets: true },
      where: [
        { id: messageId, visibleStatus: MessageVisibilityStatus.ACTIVE },
        { id: messageId, visibleStatus: MessageVisibilityStatus.EDITED },
      ],
    });
  }

  async updateMessage(
    messageId: string,
    dto: EditMessageDto,
    queryRunner: QueryRunner,
  ): Promise<Message | null> {
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
