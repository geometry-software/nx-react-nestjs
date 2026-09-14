import { ApiProperty } from '@nestjs/swagger';
import type { EntityId } from '@nx-react-nestjs/backend-utils';
import {
  Column,
  CreateDateColumn,
  Entity,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'products' })
export class Product {
  @ObjectIdColumn()
  @ApiProperty({ type: String })
  id!: EntityId;

  @Column()
  @ApiProperty()
  name!: string;

  @Column()
  @ApiProperty()
  price!: number;

  @Column()
  @ApiProperty({ minimum: 0 })
  quantity!: number;

  @Column()
  @ApiProperty()
  description!: string;

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
