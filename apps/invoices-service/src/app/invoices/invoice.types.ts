import type { InvoiceItem, InvoiceStatus } from './entities/invoice.entity';

export type CreateInvoiceRecord = {
  name: string;
  description: string;
  status: InvoiceStatus;
  items: InvoiceItem[];
  total: number;
};

export type UpdateInvoiceRecord = Partial<
  Pick<CreateInvoiceRecord, 'name' | 'description' | 'status'>
>;
