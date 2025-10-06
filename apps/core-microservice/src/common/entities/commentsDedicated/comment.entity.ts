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
import { CommentMention } from './comment-mention.entity';
import { Post } from '../postsDedicated/post.entity';
import { Profile } from '../accountDedicated/profile.entity';
import { CommentLike } from './comment-like.entity';

@Entity('comments', { schema: 'main' })
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  post_id: string;

  @Column({ type: 'uuid' })
  parent_comment_id: string;

  @Column({ type: 'uuid' })
  profile_id: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'enum', enum: ['active', 'deleted'] })
  status: 'active' | 'deleted';

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(
    () => CommentMention,
    (commentMention): Comment => commentMention.comment,
  )
  comment_mentions: CommentMention[];

  @ManyToOne(() => Post, (post) => post.comments, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @ManyToOne(() => Profile, (profile): Comment[] => profile.comments, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;

  @OneToMany(() => CommentLike, (commentLike) => commentLike.comment)
  commentLikes: CommentLike[];
}
