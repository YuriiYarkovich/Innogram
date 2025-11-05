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
import { Post } from '../posts/post.entity';
import { Comment } from '../comments/comment.entity';
import { ChatParticipant } from '../chat/chat-participant.entity';
import { Message } from '../chat/message.entity';
import { PostLike } from '../posts/post-like.entity';
import { CommentLike } from '../comments/comment-like.entity';
import { ApiProperty } from '@nestjs/swagger';
import { MessageReceiver } from '../chat/Message-Receiver.entity';

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
  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

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
  @Column({ type: 'varchar', length: 100, name: 'display_name' })
  displayName: string;

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
  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    name: 'avatar_filename',
  })
  avatarFileName: string;

  @ApiProperty({
    example: 'true',
    description: 'Status of the publicity of account',
  })
  @Column({ type: 'boolean', default: true, name: 'is_public' })
  isPublic: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'uuid', nullable: true })
  updated_by: string;

  @Column({ type: 'boolean', default: false })
  deleted: boolean;

  // Relations
  @ManyToOne(
    (): typeof User => User,
    (user: User): Profile[] => user.profiles,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(
    (): typeof ProfileFollow => ProfileFollow,
    (follow: ProfileFollow): Profile => follow.followerProfile,
  )
  following: ProfileFollow[];

  @OneToMany(
    (): typeof ProfileFollow => ProfileFollow,
    (follow: ProfileFollow): Profile => follow.followedProfile,
  )
  followers: ProfileFollow[];

  @OneToMany((): typeof Post => Post, (post: Post): Profile => post.profile)
  posts: Post[];

  @OneToMany(
    (): typeof Comment => Comment,
    (comment: Comment): Profile => comment.profile,
  )
  comments: Comment[];

  @OneToMany(
    (): typeof ChatParticipant => ChatParticipant,
    (chatParticipant: ChatParticipant): Profile => chatParticipant.profile,
  )
  chatParticipants: ChatParticipant[];

  @OneToMany(
    (): typeof Message => Message,
    (message: Message): Profile => message.sender,
  )
  messages: Message[];

  @OneToMany(
    (): typeof PostLike => PostLike,
    (postLike: PostLike): Profile => postLike.profile,
  )
  postLikes: PostLike[];

  @OneToMany(
    (): typeof CommentLike => CommentLike,
    (commentLike: CommentLike): Profile => commentLike.profile,
  )
  commentLikes: CommentLike[];

  @OneToMany(
    (): typeof MessageReceiver => MessageReceiver,
    (messageReceiver: MessageReceiver): Profile => messageReceiver.receiver,
  )
  messageReceivers: MessageReceiver[];
}
