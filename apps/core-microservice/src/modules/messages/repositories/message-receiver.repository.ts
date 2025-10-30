import { Injectable } from '@nestjs/common';
import { QueryRunner, Repository } from 'typeorm';
import { MessageReceiver } from '../../../common/entities/chat/Message-Receiver.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageReadStatus } from '../../../common/enums/message.enum';

@Injectable()
export class MessageReceiverRepository {
  constructor(
    @InjectRepository(MessageReceiver)
    private readonly messageReceiverRepository: Repository<MessageReceiver>,
  ) {}

  async createMessageReceiver(
    messageId: string,
    receiverId: string,
    queryRunner: QueryRunner,
  ): Promise<MessageReceiver> {
    const messageReceiver: MessageReceiver = queryRunner.manager.create(
      MessageReceiver,
      { messageId, receiverId },
    );

    await queryRunner.manager.save(messageReceiver);
    return messageReceiver;
  }

  async createReadMessageReceiver(
    messageId: string,
    receiverId: string,
    queryRunner: QueryRunner,
  ): Promise<MessageReceiver> {
    const messageReceiver: MessageReceiver = queryRunner.manager.create(
      MessageReceiver,
      { messageId, receiverId, readStatus: MessageReadStatus.READ },
    );

    await queryRunner.manager.save(messageReceiver);
    return messageReceiver;
  }

  async getUnreadMessagesIdsOfProfile(
    receiverProfileId: string,
  ): Promise<string[]> {
    const messages: MessageReceiver[] =
      await this.messageReceiverRepository.find({
        select: ['messageId'],
        where: {
          receiverId: receiverProfileId,
          readStatus: MessageReadStatus.UNREAD,
        },
      });
    return messages.map((m: MessageReceiver): string => m.messageId);
  }

  async updateReadStatus(messageId: string) {
    await this.messageReceiverRepository.update(
      {
        messageId,
      },
      { readStatus: MessageReadStatus.READ },
    );
  }
}
