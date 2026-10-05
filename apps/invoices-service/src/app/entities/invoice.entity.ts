import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { EntityId } from 'geometry-sdk/adapters';
import {
  Column,
  CreateDateColumn,
  Entity,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';

export const invoiceStatuses = ['pending', 'complete', 'rejected'] as const;
export type InvoiceStatus = (typeof invoiceStatuses)[number];

export type InvoiceItem = {
  productId: string;
  name: string;
  description: string;
  unitPrice: number;
  quantity: number;
};

@Entity({ name: 'invoices' })
export class Invoice {
  @ObjectIdColumn()
  @ApiProperty({ type: String })
  id!: EntityId;

  @Column()
  @ApiProperty()
  name!: string;

  @Column()
  @ApiPropertyOptional()
  description!: string;

  @Column()
  @ApiProperty({ enum: invoiceStatuses })
  status!: InvoiceStatus;

  @Column()
  @ApiProperty({ type: Array })
  items!: InvoiceItem[];

  @Column()
  @ApiProperty({ minimum: 0 })
  total!: number;

  @CreateDateColumn()
  @ApiProperty()
  createdAt!: Date;

  @UpdateDateColumn()
  @ApiProperty()
  updatedAt!: Date;
}
