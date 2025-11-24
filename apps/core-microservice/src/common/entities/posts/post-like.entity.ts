import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Profile } from '../account/profile.entity';
import { Post } from './post.entity';

@Entity('post_likes', { schema: 'main' })
export class PostLike {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'post_id' })
  postId: string;

  @Column({ type: 'uuid', name: 'profile_id' })
  profileId: string;

  @ManyToOne(
    (): typeof Profile => Profile,
    (profile: Profile): PostLike[] => profile.postLikes,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;

  @ManyToOne(
    (): typeof Post => Post,
    (post: Post): PostLike[] => post.postLikes,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'post_id' })
  post: Post;
}
