import type { EntityId } from '@nx-react-nestjs/backend-utils';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'accounts' })
export class Account {
  @ObjectIdColumn() id!: EntityId;
  @Index('email_1', { unique: true }) @Column() email!: string;
  @Column() passwordHash!: string;
  @Column() name!: string;
  @CreateDateColumn() createdAt!: Date;
  @UpdateDateColumn() updatedAt!: Date;
}
