import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { MongoDbAdapterModel } from 'geometry-sdk/adapters';

export enum InvoiceStatus {
  Pending = 'pending',
  Complete = 'complete',
  Rejected = 'rejected',
}

export type InvoiceItem = {
  productId: string;
  name: string;
  description: string;
  unitPrice: number;
  quantity: number;
};

export class Invoice implements MongoDbAdapterModel {
  @ApiProperty({ type: String })
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional()
  description!: string;

  @ApiProperty({ enum: InvoiceStatus })
  status!: InvoiceStatus;

  @ApiProperty({ type: Array })
  items!: InvoiceItem[];

  @ApiProperty({ minimum: 0 })
  total!: number;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
