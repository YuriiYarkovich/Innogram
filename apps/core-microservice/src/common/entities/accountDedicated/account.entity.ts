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
  @Column({ type: 'uuid' })
  user_id: string;

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
  @Column({ type: 'varchar', length: 255 })
  password_hash: string;

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
  @Column({ type: 'varchar', length: 255, nullable: true })
  provider_id: string;

  @Column({ type: 'timestamp', nullable: true })
  last_login_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'uuid' })
  created_by: string;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'uuid', nullable: true })
  updated_by: string;

  // Relations
  @ManyToOne(() => User, (user) => user.accounts, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
