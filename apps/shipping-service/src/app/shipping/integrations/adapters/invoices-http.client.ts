import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ExternalHttpClient,
  getInternalServiceOrigin,
} from '@nx-react-nestjs/backend-utils';
import {
  InvoiceBillingPort,
  type ShippingInvoice,
} from '../ports/invoice-billing.port';

@Injectable()
export class InvoicesHttpClient implements InvoiceBillingPort {
  constructor(
    private readonly config: ConfigService,
    private readonly http: ExternalHttpClient,
  ) {}

  async resolveInvoices(ids: string[]): Promise<ShippingInvoice[]> {
    const baseUrl = getInternalServiceOrigin(
      this.config,
      'INVOICES_PORT',
      3005,
    );
    const payload = await this.http.execute<{ data: ShippingInvoice[] }>({
      provider: 'Invoices service',
      url: `${baseUrl}/api/invoices/resolve`,
      config: { method: 'POST', data: { ids } },
      retry: { attempts: 2, baseDelayMs: 100 },
    });
    return payload.data;
  }
}
