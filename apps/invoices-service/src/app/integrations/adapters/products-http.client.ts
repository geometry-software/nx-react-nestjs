import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ExternalHttpClient,
  getInternalServiceOrigin,
} from 'geometry-sdk/adapters';
import {
  type InvoiceProduct,
  ProductCatalogPort,
  type StockSelection,
} from '../ports/product-catalog.port';

@Injectable()
export class ProductsHttpClient implements ProductCatalogPort {
  constructor(
    private readonly config: ConfigService,
    private readonly http: ExternalHttpClient,
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
    const baseUrl = getInternalServiceOrigin(
      this.config,
      'PRODUCTS_PORT',
      3002,
    );
    return this.http.execute<T>({
      service: 'Products service',
      url: `${baseUrl}${path}`,
      config: { method: 'POST', data: body },
      retry,
    });
  }
}
