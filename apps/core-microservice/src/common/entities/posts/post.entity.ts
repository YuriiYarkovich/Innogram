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
import { Profile } from '../account/profile.entity';
import { PostAsset } from './post-asset.entity';
import { Comment } from '../comments/comment.entity';
import { PostLike } from './post-like.entity';
import { ApiProperty } from '@nestjs/swagger';
import { PostStatus } from '../../enums/post.enum';

@Entity('posts', { schema: 'main' })
export class Post {
  @ApiProperty({
    example: '444b2df4-d3f6-4dc3-a7e4-5f1bff9ce441',
    description: 'unique identifier',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: '444b2df4-d3f6-4dc3-a7e4-5f1bff9ce441',
    description: `Reference to the author's profile`,
  })
  @Column({ type: 'uuid', name: 'profile_id' })
  profileId: string;

  @ApiProperty({
    example: 'Today in Paris ;-)',
    description: 'Content of the post',
  })
  @Column({ type: 'text' })
  content: string;

  @ApiProperty({
    example: 'active',
    description: 'Status of the post',
  })
  @Column({
    type: 'enum',
    enum: PostStatus,
    default: PostStatus.ACTIVE,
  })
  status: PostStatus.ACTIVE | PostStatus.ARCHIVED | PostStatus.DELETED;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @UpdateDateColumn()
  archived_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  // Relations
  @ManyToOne(
    (): typeof Profile => Profile,
    (profile: Profile): Post[] => profile.posts,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;

  @OneToMany(
    (): typeof PostAsset => PostAsset,
    (postAsset: PostAsset): Post => postAsset.post,
  )
  postAssets: PostAsset[];

  @OneToMany(
    (): typeof Comment => Comment,
    (comment: Comment): Post => comment.post,
  )
  comments: Comment[];

  @OneToMany(
    (): typeof PostLike => PostLike,
    (postLike: PostLike): Post => postLike.post,
  )
  postLikes: PostLike[];
}
