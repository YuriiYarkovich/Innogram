import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Profile } from '../account/profile.entity';
import { Comment } from './comment.entity';

@Entity('comment_likes', { schema: 'main' })
export class CommentLike {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  comment_id: string;

  @Column({ type: 'uuid' })
  profile_id: string;

  @ManyToOne(() => Profile, (profile): CommentLike[] => profile.commentLikes, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;

  @ManyToOne(() => Comment, (comment): CommentLike[] => comment.commentLikes, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'comment_id' })
  comment: Comment;
}
