import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from '../../../common/entities/chat/message.entity';
import { QueryRunner, Repository } from 'typeorm';
import { CreateMessageDto } from '../dto/create-message.dto';
import { EditMessageDto } from '../dto/edit-message.dto';
import { MessageVisibilityStatus } from '../../../common/enums/message.enum';

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

  async getAllMessagesOfChat(chatId: string): Promise<Message[]> {
    return await this.messageRepository.find({
      relations: {
        assets: true,
      },
      where: [
        { chatId: chatId, visibleStatus: MessageVisibilityStatus.ACTIVE },
        { chatId: chatId, visibleStatus: MessageVisibilityStatus.EDITED },
      ],
    });
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
