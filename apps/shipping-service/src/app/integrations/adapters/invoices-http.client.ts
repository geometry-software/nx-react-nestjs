import { Inject, Injectable } from '@nestjs/common';
import { FetchAdapter } from 'geometry-sdk/adapters';
import { INVOICES_HTTP_BASE_URL } from '../../providers/invoices-http.provider';
import {
  InvoiceBillingPort,
  type ShippingInvoice,
} from '../ports/invoice-billing.port';

@Injectable()
export class InvoicesHttpClient implements InvoiceBillingPort {
  constructor(
    @Inject(INVOICES_HTTP_BASE_URL) private readonly baseUrl: string,
    private readonly http: FetchAdapter,
  ) {}

  async resolveInvoices(ids: string[]): Promise<ShippingInvoice[]> {
    const payload = await this.http.execute<{ data: ShippingInvoice[] }>({
      service: 'Invoices service',
      url: `${this.baseUrl}/api/invoices/resolve`,
      config: { method: 'POST', data: { ids } },
      retry: { attempts: 2, baseDelayMs: 100 },
    });
    return payload.data;
  }
}
