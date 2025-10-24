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
  @Column({ type: 'uuid' })
  profile_id: string;

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
    enum: ['active', 'archived', 'deleted'],
    default: 'active',
  })
  status: 'active' | 'archived' | 'deleted';

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @UpdateDateColumn()
  archived_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  // Relations
  @ManyToOne(() => Profile, (profile) => profile.posts, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;

  @OneToMany(() => PostAsset, (postAsset) => postAsset.post)
  postAssets: PostAsset[];

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @OneToMany(() => PostLike, (postLike) => postLike.post)
  postLikes: PostLike[];
}
