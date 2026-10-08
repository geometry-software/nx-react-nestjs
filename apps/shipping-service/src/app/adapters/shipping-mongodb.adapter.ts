import { Inject, Injectable } from '@nestjs/common';
import {
  type MongoDbOrmProviderAdapter,
  type MongoCollectionAdapterQuery,
  type PageableCollectionAdapter,
  type PaginatedResult,
} from 'geometry-sdk/adapters';
import { shippingMongoProviderConfiguration } from '../providers/shipping-mongo.provider';
import { Shipment } from '../entities/shipment.entity';
import type { CreateShipmentRecord, UpdateShipmentRecord } from '../shipping.types';

@Injectable()
export class ShippingMongoDBAdapter implements PageableCollectionAdapter<
  Shipment, UpdateShipmentRecord, MongoCollectionAdapterQuery, PaginatedResult<Shipment>
> {
  constructor(
    @Inject(shippingMongoProviderConfiguration.collections[0].token)
    private readonly adapter: MongoDbOrmProviderAdapter<Shipment, CreateShipmentRecord, UpdateShipmentRecord>,
  ) {}

  public getSource(): string {
    return this.adapter.getSource();
  }

  public setSource(source: string): void {
    this.adapter.setSource(source);
  }

  public findAll(): Promise<Shipment[]> {
    return this.adapter.findAll();
  }

  public findPage(request: MongoCollectionAdapterQuery): Promise<PaginatedResult<Shipment>> {
    return this.adapter.findPage(request);
  }

  public query(expression: string): Promise<Shipment[]> {
    return this.adapter.query(expression);
  }

  public findOne(id: string): Promise<Shipment> {
    return this.adapter.findOne(id);
  }

  public create(value: Shipment): Promise<Shipment> {
    return this.adapter.create(value);
  }

  public update(id: string, value: UpdateShipmentRecord): Promise<Shipment> {
    return this.adapter.update(id, value);
  }

  public remove(id: string): Promise<{ deleted: true }> {
    return this.adapter.remove(id);
  }

  public removeMany(ids: string[]): Promise<{ deleted: number }> {
    return this.adapter.removeMany(ids);
  }
}
