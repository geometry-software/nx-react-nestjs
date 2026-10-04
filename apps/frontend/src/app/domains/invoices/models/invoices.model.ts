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
