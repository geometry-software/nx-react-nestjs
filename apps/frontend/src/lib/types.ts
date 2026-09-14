export type Meta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};
export type Page<T> = { data: T[]; meta: Meta };
export type DeleteResponse = { deleted: true };
export type BulkDeleteResponse = { deleted: number };
export type CountryLocation = { code: string; name: string; flag?: string };
export type CityLocation = { name: string };
export type Product = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  description: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};
export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'viewer';
  active: boolean;
  createdAt: string;
  updatedAt: string;
};
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

export type InvoiceStatus = 'pending' | 'complete' | 'rejected';
export type InvoiceItem = {
  productId: string;
  name: string;
  description: string;
  unitPrice: number;
  quantity: number;
};
export type Invoice = {
  id: string;
  name: string;
  description: string;
  status: InvoiceStatus;
  items: InvoiceItem[];
  total: number;
  createdAt: string;
  updatedAt: string;
};
export type InvoiceInput = {
  name: string;
  description?: string;
  items: Array<{ productId: string; quantity: number }>;
};
