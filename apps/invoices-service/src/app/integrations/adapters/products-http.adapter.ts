import { Inject, Injectable } from '@nestjs/common';
import { FetchAdapter } from 'geometry-sdk/adapters';
import { PRODUCTS_HTTP_ADAPTER_TOKEN } from '../../providers/products-http.provider';
import {
  type InvoiceProduct,
  ProductsAdapterPort,
  type StockSelection,
} from '../ports/products-port.adapter';

@Injectable()
export class ProductsHttpClientAdapter implements ProductsAdapterPort {
  constructor(
    @Inject(PRODUCTS_HTTP_ADAPTER_TOKEN) private readonly http: FetchAdapter,
  ) {}

  resolveProducts(ids: string[]): Promise<InvoiceProduct[]> {
    return this.request<{ data: InvoiceProduct[] }>(
      '/api/products/resolve',
      { ids },
      { attempts: 2, baseDelayMs: 100 },
    ).then(({ data }) => data);
  }

  async deductStock(items: StockSelection[]): Promise<void> {
    await this.request('/api/products/stock/deduct', { items }, false);
  }

  private request<T>(
    path: string,
    body: unknown,
    retry: false | { attempts: number; baseDelayMs?: number },
  ): Promise<T> {
    return this.http.execute<T>({
      service: 'Products service',
      url: path,
      config: { method: 'POST', data: body },
      retry,
    });
  }
}
