import { Injectable } from '@nestjs/common';
import { In, QueryRunner, Repository } from 'typeorm';
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
    readStatus: MessageReadStatus,
    queryRunner: QueryRunner,
  ): Promise<MessageReceiver> {
    const messageReceiver: MessageReceiver = queryRunner.manager.create(
      MessageReceiver,
      { messageId, receiverId, readStatus },
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

  async changeStatusToRead(messageIds: string[]) {
    await this.messageReceiverRepository.update(
      {
        messageId: In(messageIds),
        readStatus: MessageReadStatus.UNREAD,
      },
      {
        readStatus: MessageReadStatus.READ,
      },
    );
  }
}
