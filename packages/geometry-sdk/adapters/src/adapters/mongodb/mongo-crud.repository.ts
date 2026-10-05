import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import type { DeepPartial, MongoRepository, ObjectLiteral } from 'typeorm';
import type { CrudListQueryDto } from '../nest/crud-list-query.dto.js';
import type {
  BulkDeleteResult,
  EntityId,
  PaginatedResult,
} from '../core/types.js';
import type { MongoCrudOptions } from './mongo-crud-options.js';

type CrudEntity = ObjectLiteral & { id: EntityId; updatedAt: Date };

export abstract class MongoCrudRepository<
  TEntity extends CrudEntity,
  TCreateDto,
  TUpdateDto,
> {
  protected constructor(
    protected readonly repository: MongoRepository<TEntity>,
    protected readonly options: MongoCrudOptions,
  ) {}

  async findAll(query: CrudListQueryDto): Promise<PaginatedResult<TEntity>> {
    const filter = this.createFilter(query);
    const requestedSort = this.options.sortableFields.includes(query.sort)
      ? query.sort
      : (this.options.defaultSort ?? 'createdAt');
    const sort = this.options.sortFieldMap?.[requestedSort] ?? requestedSort;
    const [data, total] = await Promise.all([
      this.repository
        .createEntityCursor(filter as never)
        .sort(sort, query.order === 'asc' ? 1 : -1)
        .skip((query.page - 1) * query.limit)
        .limit(query.limit)
        .toArray(),
      this.repository.countDocuments(filter as never),
    ]);

    return {
      data,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.limit)),
      },
    };
  }

  create(dto: TCreateDto): Promise<TEntity> {
    return this.repository.save(this.repository.create(this.mapCreateDto(dto)));
  }

  async findOne(id: string): Promise<TEntity> {
    const entity = ObjectId.isValid(id)
      ? await this.repository.findOneBy({ id: new ObjectId(id) } as never)
      : null;
    if (!entity)
      throw new NotFoundException(`${this.options.entityName} not found`);
    return entity;
  }

  async update(id: string, dto: TUpdateDto): Promise<TEntity> {
    const entity = await this.findOne(id);
    return this.repository.save(
      Object.assign(entity, this.mapUpdateDto(dto), { updatedAt: new Date() }),
    );
  }

  async remove(id: string): Promise<{ deleted: true }> {
    const entity = await this.findOne(id);
    await this.repository.remove(entity);
    return { deleted: true };
  }

  async removeMany(ids: string[]): Promise<BulkDeleteResult> {
    if (ids.some((id) => !ObjectId.isValid(id))) {
      throw new BadRequestException('One or more entity ids are invalid');
    }
    const result = await this.repository.deleteMany({
      _id: { $in: ids.map((id) => new ObjectId(id)) },
    });
    return { deleted: result.deletedCount };
  }

  protected abstract mapCreateDto(dto: TCreateDto): DeepPartial<TEntity>;

  protected createFilter(query: CrudListQueryDto): Record<string, unknown> {
    const search = query.search?.trim();
    return search
      ? {
          $or: this.options.searchableFields.map((field) => ({
            [field]: { $regex: this.escapeRegex(search), $options: 'i' },
          })),
        }
      : {};
  }

  protected mapUpdateDto(dto: TUpdateDto): DeepPartial<TEntity> {
    return dto as DeepPartial<TEntity>;
  }

  protected escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
