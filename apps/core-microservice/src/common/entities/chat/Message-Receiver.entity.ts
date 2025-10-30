import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Profile } from '../account/profile.entity';
import { Message } from './message.entity';
import { MessageReadStatus } from '../../enums/message.enum';

@Entity('messages_receiver', { schema: 'main' })
export class MessageReceiver {
  @ApiProperty({
    example: '444b2df4-d3f6-4dc3-a7e4-5f1bff9ce441',
    description: 'unique identifier',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: '444b2df4-d3f6-4dc3-a7e4-5f1bff9ce441',
    description: 'Reference to the receiver profile',
  })
  @Column({ type: 'uuid', name: 'receiver_id' })
  receiverId: string;

  @ApiProperty({
    example: '444b2df4-d3f6-4dc3-a7e4-5f1bff9ce441',
    description: 'Reference to the message',
  })
  @Column({ type: 'uuid', name: 'message_id' })
  messageId: string;

  @ApiProperty({
    example: 'unread',
    description: 'read status of the message',
  })
  @Column({
    type: 'enum',
    enum: MessageReadStatus,
    default: MessageReadStatus.UNREAD,
    name: 'read_status',
  })
  readStatus: MessageReadStatus.READ | MessageReadStatus.UNREAD;

  @ManyToOne(
    (): typeof Profile => Profile,
    (profile: Profile): MessageReceiver[] => profile.messageReceivers,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'receiver_id' })
  receiver: Profile;

  @ManyToOne(
    (): typeof Message => Message,
    (message: Message): MessageReceiver[] => message.messageReceivers,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'message_id' })
  message: Message;
}
