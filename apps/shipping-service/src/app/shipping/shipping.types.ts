import type {
  ShipmentItem,
  ShipmentInvoice,
  ShipmentRecipient,
  ShipmentStatus,
  ShipmentTrackingEvent,
  ShipmentUser,
} from './entities/shipment.entity';

export type CreateShipmentRecord = {
  trackingNumber: string;
  status: ShipmentStatus;
  recipient: ShipmentRecipient;
  items: ShipmentItem[];
  invoices: ShipmentInvoice[];
  createdBy: ShipmentUser;
  trackingEvents: ShipmentTrackingEvent[];
};

export type UpdateShipmentRecord = Partial<CreateShipmentRecord>;
