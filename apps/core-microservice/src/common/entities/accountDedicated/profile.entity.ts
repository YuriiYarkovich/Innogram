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
import { User } from './user.entity';
import { ProfileFollow } from './profile-follow.entity';
import { Post } from '../postsDedicated/post.entity';
import { Comment } from '../commentsDedicated/comment.entity';
import { ChatParticipant } from '../chatDedicated/chat-participant.entity';
import { Message } from '../chatDedicated/message.entity';
import { PostLike } from '../postsDedicated/post-like.entity';
import { CommentLike } from '../commentsDedicated/comment-like.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('profiles', { schema: 'main' })
export class Profile {
  @ApiProperty({
    example: '444b2df4-d3f6-4dc3-a7e4-5f1bff9ce441',
    description: 'unique identifier',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: '444b2df4-d3f6-4dc3-a7e4-5f1bff9ce441',
    description: 'reference to user',
  })
  @Column({ type: 'uuid' })
  user_id: string;

  @ApiProperty({
    example: 'Ceclik',
    description: 'username of profile',
    type: 'string',
  })
  @Column({ type: 'varchar', length: 50, unique: true })
  username: string;

  @ApiProperty({
    example: 'Ceclik',
    description: 'Nick, that other users will see',
  })
  @Column({ type: 'varchar', length: 100 })
  display_name: string;

  @ApiProperty({
    example: '2003-06-30',
    description: 'Date of birth of user',
  })
  @Column({ type: 'date', nullable: true })
  birthday: Date;

  @ApiProperty({
    example: 'Hello, I am Ceclik, I am 34 y.o.',
    description: 'Description of users profile',
  })
  @Column({ type: 'text', nullable: true })
  bio: string;

  @ApiProperty({
    example: 'Hello, I am ceclik, I am 34 y.o.',
    description: 'Description of users profile',
  })
  @Column({ type: 'varchar', length: 500, nullable: true })
  avatar_url: string;

  @ApiProperty({
    example: 'true',
    description: 'Status of the publicity of account',
  })
  @Column({ type: 'boolean', default: true })
  is_public: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'uuid', nullable: true })
  updated_by: string;

  @Column({ type: 'boolean', default: false })
  deleted: boolean;

  // Relations
  @ManyToOne(() => User, (user): Profile[] => user.profiles, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => ProfileFollow, (follow) => follow.followerProfile)
  following: ProfileFollow[];

  @OneToMany(() => ProfileFollow, (follow) => follow.followedProfile)
  followers: ProfileFollow[];

  @OneToMany(() => Post, (post) => post.profile)
  posts: Post[];

  @OneToMany(() => Comment, (comment): Profile => comment.profile)
  comments: Comment[];

  @OneToMany(
    () => ChatParticipant,
    (chatParticipant): Profile => chatParticipant.profile,
  )
  chatParticipants: ChatParticipant[];

  @OneToMany(() => Message, (message) => message.sender)
  messages: Message[];

  @OneToMany(() => PostLike, (postLike) => postLike.profile)
  postLikes: PostLike[];

  @OneToMany(() => CommentLike, (commentLike) => commentLike.profile)
  commentLikes: CommentLike[];
}
