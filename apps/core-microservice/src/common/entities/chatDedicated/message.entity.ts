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
import { Profile } from '../accountDedicated/profile.entity';
import { MessageAsset } from './message_asset.entity';

@Entity('messages', { schema: 'main' })
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  chat_id: string;

  @Column({ type: 'uuid' })
  sender_id: string;

  @Column({ type: 'uuid', nullable: true })
  reply_to_message_id: string;

  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'enum',
    enum: ['active', 'edited', 'deleted'],
    default: 'active',
  })
  status: 'active' | 'edited' | 'deleted';

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn({ nullable: true })
  updated_at: Date;

  @DeleteDateColumn({ nullable: true })
  deleted_at: Date;

  @ManyToOne(() => Chat, (chat): Message[] => chat.messages, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'chat_id' })
  chat: Chat;

  @ManyToOne(() => Profile, (profile): Message[] => profile.messages, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'sender_id' })
  sender: Profile;

  @OneToMany(() => MessageAsset, (messageAsset) => messageAsset.message)
  assets: MessageAsset[];
}
