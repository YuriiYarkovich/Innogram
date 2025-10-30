import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Post } from './post.entity';
import { AssetType } from '../../enums/message.enum';

@Entity('post_assets', { schema: 'main' })
export class PostAsset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'post_id' })
  postId: string;

  @Column({ type: 'enum', enum: AssetType })
  type: AssetType.VIDEO | AssetType.IMAGE;

  @Column({ type: 'text', name: 'hashed_file_name' })
  hashedFileName: string;

  @Column({ type: 'int' })
  order: number;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(
    (): typeof Post => Post,
    (post: Post): PostAsset[] => post.postAssets,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'post_id' })
  post: Post;

  url?: string;
}
