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
import { Post } from '../posts/post.entity';
import { Profile } from '../account/profile.entity';
import { CommentLike } from './comment-like.entity';
import { ApiProperty } from '@nestjs/swagger';
import { CommentStatus } from '../../enums/comment.enum';

@Entity('comments', { schema: 'main' })
export class Comment {
  @ApiProperty({
    example: '444b2df4-d3f6-4dc3-a7e4-5f1bff9ce441',
    description: 'unique identifier',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: '444b2df4-d3f6-4dc3-a7e4-5f1bff9ce441',
    description: 'Reference to the post',
  })
  @Column({ type: 'uuid', name: 'post_id' })
  postId: string;

  @ApiProperty({
    example: '444b2df4-d3f6-4dc3-a7e4-5f1bff9ce441',
    description: 'Reference to the parent comment',
  })
  @Column({ type: 'uuid', nullable: true, name: 'parent_comment_id' })
  parentCommentId: string;

  @ApiProperty({
    example: '444b2df4-d3f6-4dc3-a7e4-5f1bff9ce441',
    description: `Reference to the author's profile`,
  })
  @Column({ type: 'uuid', name: 'profile_id' })
  profileId: string;

  @ApiProperty({
    example: 'Wow! You look very gorgeous today!',
    description: 'Text of the message',
  })
  @Column({ type: 'text' })
  content: string;

  @ApiProperty({
    example: 'active',
    description: 'status of the comment',
  })
  @Column({ type: 'enum', enum: CommentStatus, default: CommentStatus.ACTIVE })
  status: CommentStatus.ACTIVE | CommentStatus.DELETED;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(
    (): typeof CommentMention => CommentMention,
    (commentMention: CommentMention): Comment => commentMention.comment,
  )
  comment_mentions: CommentMention[];

  @ManyToOne(
    (): typeof Post => Post,
    (post: Post): Comment[] => post.comments,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @ManyToOne(
    (): typeof Profile => Profile,
    (profile: Profile): Comment[] => profile.comments,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;

  @OneToMany(
    (): typeof CommentLike => CommentLike,
    (commentLike: CommentLike): Comment => commentLike.comment,
  )
  commentLikes: CommentLike[];
}
