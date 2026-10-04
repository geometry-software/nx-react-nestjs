export type CountryLocation = { code: string; name: string; flag?: string };
export type CityLocation = { name: string };

export type ShipmentStatus =
  | 'created'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'exception'
  | 'cancelled';

export type ShipmentItem = {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
};

export type ShipmentTrackingEvent = {
  status: string;
  location?: string;
  occurredAt: string;
  source: 'local' | 'dummy-package-place';
};

export type Shipment = {
  id: string;
  trackingNumber: string;
  status: ShipmentStatus;
  recipient: {
    name: string;
    address: string;
    city: string;
    country: string;
  };
  items: ShipmentItem[];
  invoices: Array<{ invoiceId: string; name: string; total: number }>;
  createdBy?: {
    userId: string;
    name: string;
    email: string;
    role: string;
  };
  trackingEvents: ShipmentTrackingEvent[];
  createdAt: string;
  updatedAt: string;
};

export type ShipmentInput = {
  createdByUserId: string;
  recipient: Shipment['recipient'];
  invoiceIds: string[];
};
