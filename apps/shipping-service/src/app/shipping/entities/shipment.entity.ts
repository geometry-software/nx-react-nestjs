import { ApiProperty } from '@nestjs/swagger';
import type { EntityId } from '@nx-react-nestjs/backend-utils';
import {
  Column,
  CreateDateColumn,
  Entity,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';

export const shipmentStatuses = [
  'created',
  'in_transit',
  'out_for_delivery',
  'delivered',
  'exception',
  'cancelled',
] as const;

export type ShipmentStatus = (typeof shipmentStatuses)[number];

export type ShipmentRecipient = {
  name: string;
  address: string;
  city: string;
  country: string;
};

export type ShipmentItem = {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
};

export type ShipmentUser = {
  userId: string;
  name: string;
  email: string;
  role: string;
};

export type ShipmentInvoice = {
  invoiceId: string;
  name: string;
  total: number;
};

export type ShipmentTrackingEvent = {
  status: string;
  location?: string;
  occurredAt: string;
  source: 'local' | 'dummy-package-place';
};

@Entity({ name: 'shipments' })
export class Shipment {
  @ObjectIdColumn()
  @ApiProperty({ type: String })
  id!: EntityId;

  @Column()
  @ApiProperty()
  trackingNumber!: string;

  @Column()
  @ApiProperty({ enum: shipmentStatuses })
  status!: ShipmentStatus;

  @Column()
  @ApiProperty()
  recipient!: ShipmentRecipient;

  @Column()
  @ApiProperty({ isArray: true })
  items!: ShipmentItem[];

  @Column()
  @ApiProperty({ isArray: true })
  invoices!: ShipmentInvoice[];

  @Column()
  @ApiProperty()
  createdBy!: ShipmentUser;

  @Column()
  @ApiProperty({ isArray: true })
  trackingEvents!: ShipmentTrackingEvent[];

  @CreateDateColumn()
  @ApiProperty()
  createdAt!: Date;

  @UpdateDateColumn()
  @ApiProperty()
  updatedAt!: Date;
}
