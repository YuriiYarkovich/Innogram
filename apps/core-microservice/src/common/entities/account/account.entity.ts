import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('accounts', { schema: 'main' })
export class Account {
  @ApiProperty({
    example: '444b2df4-d3f6-4dc3-a7e4-5f1bff9ce441',
    description: 'Unique identifier',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: '444b2df4-d3f6-4dc3-a7e4-5f1bff9ce441',
    description: 'Reference to user',
  })
  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ApiProperty({
    example: 'CeclikG@gmail.com',
    description: 'Email of user',
  })
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @ApiProperty({
    example: '444b2df4-d3f6-4dc3-a7e4-5f1bff9ce441',
    description: `Hash of user's password`,
  })
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'password_hash',
  })
  passwordHash: string;

  @ApiProperty({
    example: 'Google',
    description: 'Authentification provider',
  })
  @Column({ type: 'varchar', length: 20, default: 'local' })
  provider: string;

  @ApiProperty({
    example: '444b2df4-d3f6-4dc3-a7e4-5f1bff9ce441',
    description: 'ID of authentification provider',
  })
  @Column({ type: 'varchar', length: 255, nullable: true, name: 'provider_id' })
  providerId: string;

  @Column({ type: 'timestamp', nullable: true, name: 'last_login_at' })
  lastLoginAt: Date;

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'uuid', name: 'created_by' })
  createdBy: string;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'uuid', nullable: true, name: 'updated_by' })
  updatedBy: string;

  // Relations
  @ManyToOne(
    (): typeof User => User,
    (user: User): Account[] => user.accounts,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'user_id' })
  user: User;
}
