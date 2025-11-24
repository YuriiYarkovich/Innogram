import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Profile } from '../account/profile.entity';
import { Chat } from './chat.entity';
import { ChatParticipantRole } from '../../enums/chat.enum';

@Entity('chat_participants', { schema: 'main' })
export class ChatParticipant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'profile_id' })
  profileId: string;

  @Column({ type: 'uuid', name: 'chat_id' })
  chatId: string;

  @Column({
    type: 'enum',
    enum: ChatParticipantRole,
    default: ChatParticipantRole.PARTICIPANT,
  })
  role: ChatParticipantRole.PARTICIPANT | ChatParticipantRole.ADMIN;

  @ManyToOne(
    (): typeof Profile => Profile,
    (profile: Profile): ChatParticipant[] => profile.chatParticipants,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;

  @ManyToOne(
    (): typeof Chat => Chat,
    (chat: Chat): ChatParticipant[] => chat.chatParticipants,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'chat_id' })
  chat: Chat;
}
