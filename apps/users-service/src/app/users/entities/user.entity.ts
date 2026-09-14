import { ApiProperty } from '@nestjs/swagger';
import type { EntityId } from '@nx-react-nestjs/backend-utils';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { UserRole } from '../dto/user.dto';

@Entity({ name: 'users' })
export class User {
  @ObjectIdColumn()
  @ApiProperty({ type: String })
  id!: EntityId;

  @Column()
  @ApiProperty()
  name!: string;

  @Index('email_1', { unique: true })
  @Column()
  @ApiProperty()
  email!: string;

  @Column()
  @ApiProperty({ enum: ['admin', 'manager', 'viewer'] })
  role!: UserRole;

  @Column()
  @ApiProperty()
  active!: boolean;

  @CreateDateColumn()
  @ApiProperty()
  createdAt!: Date;

  @UpdateDateColumn()
  @ApiProperty()
  updatedAt!: Date;
}
