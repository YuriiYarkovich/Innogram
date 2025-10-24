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

  @Column({ type: 'uuid' })
  comment_id: string;

  @Column({ type: 'uuid' })
  mentioned_user_id: string;

  @CreateDateColumn()
  CreatedAt: Date;

  @ManyToOne(
    () => Comment,
    (comment): CommentMention[] => comment.comment_mentions,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'comment_id' })
  comment: Comment;
}
