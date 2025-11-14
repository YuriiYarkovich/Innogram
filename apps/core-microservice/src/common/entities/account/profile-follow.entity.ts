import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Profile } from './profile.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('profiles_follows', { schema: 'main' })
@Unique(['follower_profile_id', 'followed_profile_id'])
export class ProfileFollow {
  @ApiProperty({
    example: '444b2df4-d3f6-4dc3-a7e4-5f1bff9ce441',
    description: 'unique identifier',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: '444b2df4-d3f6-4dc3-a7e4-5f1bff9ce441',
    description: 'reference to the follower profile',
  })
  @Column({ type: 'uuid', name: 'follower_profile_id' })
  follower_profile_id: string;

  @ApiProperty({
    example: '444b2df4-d3f6-4dc3-a7e4-5f1bff9ce441',
    description: 'reference to the followed profile',
  })
  @Column({ type: 'uuid', name: 'followed_profile_id' })
  followed_profile_id: string;

  @ApiProperty({
    example: 'true',
    description: 'Is following accepted',
  })
  @Column({ type: 'boolean', nullable: true })
  accepted: boolean;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(
    (): typeof Profile => Profile,
    (profile: Profile): ProfileFollow[] => profile.following,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'follower_profile_id' })
  followerProfile: Profile;

  @ManyToOne(
    (): typeof Profile => Profile,
    (profile: Profile): ProfileFollow[] => profile.followers,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'followed_profile_id' })
  followedProfile: Profile;
}
