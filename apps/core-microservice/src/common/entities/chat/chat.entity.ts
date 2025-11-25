import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ChatParticipant } from './chat-participant.entity';
import { Message } from './message.entity';
import { ApiProperty } from '@nestjs/swagger';
import { ChatStatus, ChatTypes } from '../../enums/chat.enum';

@Entity('chats', { schema: 'main' })
export class Chat {
  @ApiProperty({
    example: '444b2df4-d3f6-4dc3-a7e4-5f1bff9ce441',
    description: 'unique identifier',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'private',
    description: 'Type of the chat',
  })
  @Column({
    type: 'enum',
    enum: ChatTypes,
    default: ChatTypes.PRIVATE,
    name: 'chat_type',
  })
  chatType: ChatTypes.PRIVATE | ChatTypes.GROUP;

  @ApiProperty({
    example: 'active',
    description: 'Status of the chat',
  })
  @Column({
    type: 'enum',
    enum: ChatStatus,
    default: ChatStatus.ACTIVE,
    name: 'chat_status',
  })
  chatStatus: ChatStatus.ACTIVE | ChatStatus.ARCHIVED | ChatStatus.DELETED;

  @ApiProperty({
    example: 'The best chat',
    description: 'Title of the chat',
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  title: string;

  @ApiProperty({
    example: 'some hashed name',
    description: 'Filename of the avatar of the chat',
  })
  @Column({
    type: 'varchar',
    length: 512,
    nullable: true,
    name: 'chat_avatar_filename',
  })
  chatAvatarFilename: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(
    (): typeof ChatParticipant => ChatParticipant,
    (chatParticipant: ChatParticipant): Chat => chatParticipant.chat,
  )
  chatParticipants: ChatParticipant[];

  @OneToMany(
    (): typeof Message => Message,
    (message: Message): Chat => message.chat,
  )
  messages: Message[];
}
