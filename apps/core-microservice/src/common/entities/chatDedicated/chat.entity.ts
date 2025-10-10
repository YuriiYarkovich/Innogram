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
  @Column({ type: 'enum', enum: ['private', 'group'], default: 'private' })
  chat_type: 'private' | 'group';

  @ApiProperty({
    example: 'active',
    description: 'Status of the chat',
  })
  @Column({
    type: 'enum',
    enum: ['active', 'archived', 'deleted'],
    default: 'active',
  })
  chat_status: 'active' | 'archived' | 'deleted';

  @ApiProperty({
    example: 'The best chat',
    description: 'Title of the chat',
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  title: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ChatParticipant, (chatParticipant) => chatParticipant.chat)
  chatParticipants: ChatParticipant[];

  @OneToMany(() => Message, (message) => message.chat)
  messages: Message[];
}
