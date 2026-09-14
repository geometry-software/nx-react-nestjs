export type ShippingInvoiceItem = {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
};

export type ShippingInvoice = {
  id: string;
  name: string;
  total: number;
  status: 'pending' | 'complete' | 'rejected';
  items: ShippingInvoiceItem[];
};

export abstract class InvoiceBillingPort {
  abstract resolveInvoices(ids: string[]): Promise<ShippingInvoice[]>;
}
