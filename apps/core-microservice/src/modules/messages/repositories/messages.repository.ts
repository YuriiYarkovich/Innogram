import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from '../../../common/entities/chat/message.entity';
import { QueryRunner, Repository } from 'typeorm';
import { CreateMessageDto } from '../dto/create-message.dto';
import { EditMessageDto } from '../dto/edit-message.dto';

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

  async getAllMessagesOfChat(chatId: string) {
    return await this.messageRepository.find({
      relations: {
        assets: true,
      },
      where: [
        { chatId: chatId, visibleStatus: 'active' },
        { chatId: chatId, visibleStatus: 'edited' },
      ],
    });
  }

  async getMessageById(messageId: string) {
    return await this.messageRepository.findOne({
      relations: { assets: true },
      where: [
        { id: messageId, visibleStatus: 'active' },
        { id: messageId, visibleStatus: 'edited' },
      ],
    });
  }

  async updateMessage(
    messageId: string,
    dto: EditMessageDto,
    queryRunner: QueryRunner,
  ) {
    await queryRunner.manager.update(
      Message,
      { id: messageId },
      { content: dto.content, visibleStatus: 'edited' },
    );
    return await this.getMessageById(messageId);
  }

  async deleteMessage(messageId: string) {
    await this.messageRepository.update(
      { id: messageId },
      { visibleStatus: 'deleted' },
    );
  }
}
