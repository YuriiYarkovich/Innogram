import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Profile } from './profile.entity';
import { PostAsset } from './post-asset.entity';

@Entity('posts', { schema: 'main' })
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  profile_id: string;

  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'enum',
    enum: ['active', 'archived', 'deleted'],
  })
  status: 'active' | 'archived' | 'deleted';

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @UpdateDateColumn()
  archived_at: Date;

  @UpdateDateColumn()
  deleted_at: Date;

  // Relations
  @ManyToOne(() => Profile, (profile) => profile.posts)
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;

  @OneToMany(() => PostAsset, (postAsset) => postAsset.post)
  postAssets: PostAsset[];
}
