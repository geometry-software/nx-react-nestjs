import type { EntityId } from 'geometry-sdk/adapters';
import {
  Column,
  CreateDateColumn,
  Entity,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'sessions' })
export class Session {
  @ObjectIdColumn() id!: EntityId;
  @Column() token!: string;
  @Column() tokenProvider!: string;
  @Column() user!: User;
  @CreateDateColumn() createdAt!: Date;
  @UpdateDateColumn() updatedAt!: Date;
}
