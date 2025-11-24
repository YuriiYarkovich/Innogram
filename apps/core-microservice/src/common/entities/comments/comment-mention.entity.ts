import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Comment } from './comment.entity';

@Entity('comment_mentions', { schema: 'main' })
export class CommentMention {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'comment_id' })
  commentId: string;

  @Column({ type: 'uuid', name: 'mentioned_profile_id' })
  mentionedProfileId: string;

  @CreateDateColumn()
  CreatedAt: Date;

  @ManyToOne(
    (): typeof Comment => Comment,
    (comment: Comment): CommentMention[] => comment.comment_mentions,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'comment_id' })
  comment: Comment;
}
