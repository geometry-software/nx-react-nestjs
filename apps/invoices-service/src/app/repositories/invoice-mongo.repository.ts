import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoCrudRepository } from 'geometry-sdk/adapters';
import { MongoRepository, type DeepPartial } from 'typeorm';
import { ObjectId } from 'mongodb';
import { BadRequestException } from '@nestjs/common';
import type { CreateInvoiceRecord, UpdateInvoiceRecord } from '../invoice.types';
import type { InvoiceListQueryDto } from '../dto/invoice-list-query.dto';
import { Invoice } from '../entities/invoice.entity';

@Injectable()
export class InvoiceMongoRepository extends MongoCrudRepository<
  Invoice,
  CreateInvoiceRecord,
  UpdateInvoiceRecord
> {
  constructor(@InjectRepository(Invoice) repository: MongoRepository<Invoice>) {
    super(repository, {
      entityName: Invoice.name,
      searchableFields: ['name', 'description'],
      sortableFields: ['id', 'name', 'status', 'total', 'createdAt', 'updatedAt'],
      sortFieldMap: { id: '_id' },
      defaultSort: 'createdAt',
    });
  }

  protected mapCreateDto(dto: CreateInvoiceRecord): DeepPartial<Invoice> {
    return dto;
  }

  resolveMany(ids: string[]): Promise<Invoice[]> {
    if (ids.some((id) => !ObjectId.isValid(id))) {
      throw new BadRequestException('One or more invoice ids are invalid');
    }
    return this.repository
      .createEntityCursor({
        _id: { $in: ids.map((id) => new ObjectId(id)) },
      })
      .toArray();
  }

  protected override createFilter(
    query: InvoiceListQueryDto,
  ): Record<string, unknown> {
    return {
      ...super.createFilter(query),
      ...(query.status ? { status: query.status } : {}),
    };
  }
}
