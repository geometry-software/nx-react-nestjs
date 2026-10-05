import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { RepositoryConflictError, RepositoryNotFoundError, RepositoryValidationError } from '../core/errors.js';
import type { PageableCollectionApi } from '../core/pageable.js';
import type { RepositoryQuery } from '../core/query.js';
import type { PaginatedResult } from '../core/types.js';

/** Maps collection failures to HTTP errors without exposing a persistence SDK. */
export class CollectionCrudRepository<TData, TCreate, TUpdate> {
  constructor(
    protected readonly collection: PageableCollectionApi<TData, TCreate, TUpdate, RepositoryQuery, PaginatedResult<TData>>,
  ) {}

  findAll(query: RepositoryQuery): Promise<PaginatedResult<TData>> {
    return this.execute(() => this.collection.findPage(query));
  }

  findOne(id: string): Promise<TData> {
    return this.execute(() => this.collection.findOne(id));
  }

  create(value: TCreate): Promise<TData> {
    return this.execute(() => this.collection.create(value));
  }

  update(id: string, value: TUpdate): Promise<TData> {
    return this.execute(() => this.collection.update(id, value));
  }

  remove(id: string): Promise<{ deleted: true }> {
    return this.execute(() => this.collection.remove(id));
  }

  removeMany(ids: string[]): Promise<{ deleted: number }> {
    return this.execute(() => this.collection.removeMany(ids));
  }

  protected async execute<TResult>(operation: () => Promise<TResult>): Promise<TResult> {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof RepositoryNotFoundError) throw new NotFoundException(error.message);
      if (error instanceof RepositoryValidationError) throw new BadRequestException(error.message);
      if (error instanceof RepositoryConflictError) throw new ConflictException(error.message);
      throw error;
    }
  }
}
