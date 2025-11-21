import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Message } from './message.entity';
import { AssetType } from '../../enums/message.enum';

@Entity('message_assets', { schema: 'main' })
export class MessageAsset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'message_id' })
  messageId: string;

  @Column({ type: 'enum', enum: AssetType })
  type: AssetType.IMAGE | AssetType.VIDEO;

  @Column({ type: 'text', name: 'hashed_file_name' })
  hashedFileName: string;

  @Column({ type: 'int', default: 1 })
  order: number;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(
    (): typeof Message => Message,
    (message: Message): MessageAsset[] => message.assets,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'message_id' })
  message: Message;

  url?: string;
}
