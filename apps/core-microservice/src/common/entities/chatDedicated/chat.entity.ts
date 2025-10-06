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

@Entity('chats', { schema: 'main' })
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ['private', 'group'], default: 'private' })
  chat_type: 'private' | 'group';

  @Column({
    type: 'enum',
    enum: ['active', 'archived', 'deleted'],
    default: 'active',
  })
  chat_status: 'active' | 'archived' | 'deleted';

  @Column({ type: 'varchar', length: 255, nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ChatParticipant, (chatParticipant) => chatParticipant.chat)
  chatParticipants: ChatParticipant[];

  @OneToMany(() => Message, (message) => message.chat)
  messages: Message[];
}
