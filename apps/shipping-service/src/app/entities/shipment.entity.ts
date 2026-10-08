import { ApiProperty } from '@nestjs/swagger';
import type { MongoDbAdapterModel } from 'geometry-sdk/adapters';

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

export class Shipment implements MongoDbAdapterModel {
  @ApiProperty({ type: String })
  id!: string;

  @ApiProperty()
  trackingNumber!: string;

  @ApiProperty({ enum: shipmentStatuses })
  status!: ShipmentStatus;

  @ApiProperty()
  recipient!: ShipmentRecipient;

  @ApiProperty({ isArray: true })
  items!: ShipmentItem[];

  @ApiProperty({ isArray: true })
  invoices!: ShipmentInvoice[];

  @ApiProperty()
  createdBy!: ShipmentUser;

  @ApiProperty({ isArray: true })
  trackingEvents!: ShipmentTrackingEvent[];

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
