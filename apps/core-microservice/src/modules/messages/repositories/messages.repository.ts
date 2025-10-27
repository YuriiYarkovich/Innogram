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
    senderId: string,
    queryRunner: QueryRunner,
  ) {
    const createdMessage = queryRunner.manager.create(Message, {
      ...dto,
      sender_id: senderId,
    });

    await queryRunner.manager.save(createdMessage);

    return createdMessage;
  }

  async createReadMessage(
    dto: CreateMessageDto,
    senderId: string,
    queryRunner: QueryRunner,
  ) {
    const createdMessage = queryRunner.manager.create(Message, {
      ...dto,
      sender_id: senderId,
      read_status: 'read',
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
        { chatId: chatId, visible_status: 'active' },
        { chatId: chatId, visible_status: 'edited' },
      ],
    });
  }

  async getMessageById(messageId: string) {
    return await this.messageRepository.findOne({
      relations: { assets: true },
      where: [
        { id: messageId, visible_status: 'active' },
        { id: messageId, visible_status: 'edited' },
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
      { content: dto.content, visible_status: 'edited' },
    );
    return await this.getMessageById(messageId);
  }

  async deleteMessage(messageId: string) {
    await this.messageRepository.update(
      { id: messageId },
      { visible_status: 'deleted' },
    );
  }
}
