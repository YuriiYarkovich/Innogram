import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Chat } from './chat.entity';
import { Profile } from '../account/profile.entity';
import { MessageAsset } from './message_asset.entity';
import { ApiProperty } from '@nestjs/swagger';
import { MessageReceiver } from './Message-Receiver.entity';

@Entity('messages', { schema: 'main' })
export class Message {
  @ApiProperty({
    example: '444b2df4-d3f6-4dc3-a7e4-5f1bff9ce441',
    description: 'unique identifier',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: '444b2df4-d3f6-4dc3-a7e4-5f1bff9ce441',
    description: 'Reference to the chat',
  })
  @Column({ type: 'uuid', name: 'chat_id' })
  chatId: string;

  @ApiProperty({
    example: '444b2df4-d3f6-4dc3-a7e4-5f1bff9ce441',
    description: 'Reference to the sender profile',
  })
  @Column({ type: 'uuid', name: 'sender_id' })
  senderId: string;

  @ApiProperty({
    example: '444b2df4-d3f6-4dc3-a7e4-5f1bff9ce441',
    description: 'Reference to replying message',
  })
  @Column({ type: 'uuid', name: 'reply_to_message_id', nullable: true })
  replyToMessageId: string;

  @ApiProperty({
    example: 'Hello! How was your day!',
    description: 'Content of the message',
  })
  @Column({ type: 'text' })
  content: string;

  @ApiProperty({
    example: 'active',
    description: 'visibility status of the message',
  })
  @Column({
    type: 'enum',
    enum: ['active', 'edited', 'deleted'],
    default: 'active',
    name: 'visible_status',
  })
  visibleStatus: 'active' | 'edited' | 'deleted';

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn({ nullable: true })
  updated_at: Date;

  @DeleteDateColumn({ nullable: true })
  deleted_at: Date;

  @ManyToOne(
    (): typeof Chat => Chat,
    (chat: Chat): Message[] => chat.messages,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'chat_id' })
  chat: Chat;

  @ManyToOne(
    (): typeof Profile => Profile,
    (profile: Profile): Message[] => profile.messages,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'sender_id' })
  sender: Profile;

  @OneToMany(
    (): typeof MessageAsset => MessageAsset,
    (messageAsset: MessageAsset): Message => messageAsset.message,
  )
  assets: MessageAsset[];

  @OneToMany(
    (): typeof MessageReceiver => MessageReceiver,
    (messageReceiver: MessageReceiver): Message => messageReceiver.message,
  )
  messageReceivers: MessageReceiver[];
}
