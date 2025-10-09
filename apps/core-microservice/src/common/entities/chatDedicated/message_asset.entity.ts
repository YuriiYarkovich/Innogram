import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Message } from './message.entity';

@Entity('message_assets', { schema: 'main' })
export class MessageAsset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  message_id: string;

  @Column({ type: 'enum', enum: ['image', 'video'] })
  type: 'image' | 'video';

  @Column({ type: 'text' })
  hashed_file_name: string;

  @Column({ type: 'int', default: 1 })
  order: number;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Message, (message): MessageAsset[] => message.assets, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'message_id' })
  message: Message;

  url: string;
}
