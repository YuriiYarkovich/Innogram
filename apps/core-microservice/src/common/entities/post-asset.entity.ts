import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Post } from './post.entity';

@Entity('post_assets', { schema: 'main' })
export class PostAsset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  post_id: string;

  @Column({ type: 'enum', enum: ['image', 'video'] })
  type: 'image' | 'video';

  @Column({ type: 'text' })
  url: string;

  @Column({ type: 'int' })
  order: number;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => Post, (post) => post.postAssets)
  @JoinColumn({ name: 'post_id' })
  post: Post;
}
