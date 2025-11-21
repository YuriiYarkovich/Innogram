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

  @Column({ type: 'uuid', name: 'comment_id' })
  commentId: string;

  @Column({ type: 'uuid', name: 'profile_id' })
  profileId: string;

  @ManyToOne(
    (): typeof Profile => Profile,
    (profile: Profile): CommentLike[] => profile.commentLikes,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;

  @ManyToOne(
    (): typeof Comment => Comment,
    (comment: Comment): CommentLike[] => comment.commentLikes,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'comment_id' })
  comment: Comment;
}
