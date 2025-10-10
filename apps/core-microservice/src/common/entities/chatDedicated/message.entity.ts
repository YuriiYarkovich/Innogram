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
import { ApiProperty } from '@nestjs/swagger';

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
  @Column({ type: 'uuid' })
  chat_id: string;

  @ApiProperty({
    example: '444b2df4-d3f6-4dc3-a7e4-5f1bff9ce441',
    description: 'Reference to the sender profile',
  })
  @Column({ type: 'uuid' })
  sender_id: string;

  @ApiProperty({
    example: '444b2df4-d3f6-4dc3-a7e4-5f1bff9ce441',
    description: 'Reference to replying message',
  })
  @Column({ type: 'uuid', nullable: true })
  reply_to_message_id: string;

  @ApiProperty({
    example: 'Hello! How was your day!',
    description: 'Content of the message',
  })
  @Column({ type: 'text' })
  content: string;

  @ApiProperty({
    example: 'active',
    description: 'status of the message',
  })
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
