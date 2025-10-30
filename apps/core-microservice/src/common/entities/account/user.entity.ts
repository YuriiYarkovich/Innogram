import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Account } from './account.entity';
import { Profile } from './profile.entity';
import { ApiProperty } from '@nestjs/swagger';
import { UserRoles } from '../../enums/user-roles.enum';

@Entity('users', { schema: 'main' })
export class User {
  @ApiProperty({
    example: '444b2df4-d3f6-4dc3-a7e4-5f1bff9ce441',
    description: 'unique identifier',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'admin',
    description: 'role of user in system',
  })
  @Column({ type: 'enum', enum: UserRoles, default: 'user' })
  role: UserRoles.USER | UserRoles.ADMIN;

  @ApiProperty({
    example: 'false',
    description: 'status of user',
  })
  @Column({ type: 'boolean', default: false })
  disabled: boolean;

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'uuid', nullable: true })
  created_by: string;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'uuid', nullable: true })
  updated_by: string;

  // Relations
  @OneToMany(
    (): typeof Account => Account,
    (account: Account): User => account.user,
  )
  accounts: Account[];

  @OneToMany(
    (): typeof Profile => Profile,
    (profile: Profile): User => profile.user,
  )
  profiles: Profile[];
}
