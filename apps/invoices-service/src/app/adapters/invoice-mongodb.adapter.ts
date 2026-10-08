import { Inject, Injectable } from '@nestjs/common';
import {
  type MongoDbOrmProviderAdapter,
  type MongoCollectionAdapterQuery,
  type PageableCollectionAdapter,
  type PaginatedResult,
} from 'geometry-sdk/adapters';
import { invoicesMongoProviderConfiguration } from '../providers/invoices-mongo.provider';
import { Invoice } from '../entities/invoice.entity';
import type { CreateInvoiceRecord, UpdateInvoiceRecord } from '../invoice.types';

@Injectable()
export class InvoiceMongoDBAdapter implements PageableCollectionAdapter<
  Invoice, UpdateInvoiceRecord, MongoCollectionAdapterQuery, PaginatedResult<Invoice>
> {
  constructor(
    @Inject(invoicesMongoProviderConfiguration.collections[0].token)
    private readonly adapter: MongoDbOrmProviderAdapter<Invoice, CreateInvoiceRecord, UpdateInvoiceRecord>,
  ) {}

  public getSource(): string {
    return this.adapter.getSource();
  }

  public setSource(source: string): void {
    this.adapter.setSource(source);
  }

  public findAll(): Promise<Invoice[]> {
    return this.adapter.findAll();
  }

  public findPage(request: MongoCollectionAdapterQuery): Promise<PaginatedResult<Invoice>> {
    return this.adapter.findPage(request);
  }

  public query(expression: string): Promise<Invoice[]> {
    return this.adapter.query(expression);
  }

  public findOne(id: string): Promise<Invoice> {
    return this.adapter.findOne(id);
  }

  public create(value: Invoice): Promise<Invoice> {
    return this.adapter.create(value);
  }

  public update(id: string, value: UpdateInvoiceRecord): Promise<Invoice> {
    return this.adapter.update(id, value);
  }

  public remove(id: string): Promise<{ deleted: true }> {
    return this.adapter.remove(id);
  }

  public removeMany(ids: string[]): Promise<{ deleted: number }> {
    return this.adapter.removeMany(ids);
  }

  public resolveMany(ids: string[]): Promise<Invoice[]> {
    return this.adapter.query(JSON.stringify({ _id: { $in: ids.map((id) => ({ $oid: id })) } }));
  }
}
