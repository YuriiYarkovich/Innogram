import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Profile } from '../accountDedicated/profile.entity';
import { Chat } from './chat.entity';

@Entity('chat_participants', { schema: 'main' })
export class ChatParticipant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  profile_id: string;

  @Column({ type: 'uuid' })
  chat_id: string;

  @ManyToOne(() => Profile, (profile) => profile.chatParticipants, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;

  @ManyToOne(() => Chat, (chat): ChatParticipant[] => chat.chatParticipants, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'chat_id' })
  chat: Chat;
}
