import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoCrudRepository } from 'geometry-sdk/adapters';
import { MongoRepository, type DeepPartial } from 'typeorm';
import type { ShipmentListQueryDto } from '../dto/shipment-list-query.dto';
import { Shipment } from '../entities/shipment.entity';
import type { CreateShipmentRecord, UpdateShipmentRecord } from '../shipping.types';

@Injectable()
export class ShippingMongoRepository extends MongoCrudRepository<
  Shipment,
  CreateShipmentRecord,
  UpdateShipmentRecord
> {
  constructor(@InjectRepository(Shipment) repository: MongoRepository<Shipment>) {
    super(repository, {
      entityName: Shipment.name,
      searchableFields: ['trackingNumber', 'recipient.name'],
      sortableFields: ['id', 'createdAt', 'updatedAt', 'trackingNumber', 'status'],
      sortFieldMap: { id: '_id' },
      defaultSort: 'createdAt',
    });
  }

  protected mapCreateDto(dto: CreateShipmentRecord): DeepPartial<Shipment> {
    return dto;
  }

  protected override createFilter(
    query: ShipmentListQueryDto,
  ): Record<string, unknown> {
    return {
      ...super.createFilter(query),
      ...(query.status ? { status: query.status } : {}),
    };
  }
}
