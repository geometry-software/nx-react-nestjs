import { Inject, Injectable } from '@nestjs/common';
import type { CrudListQueryDto } from 'geometry-sdk/adapters';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import type { ProductStockItemDto } from './dto/deduct-product-stock.dto';
import { ProductMongoProviderRepository } from './repositories/product-mongo-provider.repository';

type ProductMongoProviderRepositoryPort = Pick<
  ProductMongoProviderRepository,
  | 'findAll'
  | 'findOne'
  | 'create'
  | 'update'
  | 'remove'
  | 'removeMany'
  | 'resolveMany'
  | 'deductStock'
>;

@Injectable()
export class ProductsService {
  constructor(
    @Inject(ProductMongoProviderRepository)
    private readonly repository: ProductMongoProviderRepositoryPort,
  ) {}

  findAll(query: CrudListQueryDto) {
    return this.repository.findAll(query);
  }

  findOne(id: string) {
    return this.repository.findOne(id);
  }
  create(dto: CreateProductDto) {
    return this.repository.create(dto);
  }
  update(id: string, dto: UpdateProductDto) {
    return this.repository.update(id, dto);
  }
  remove(id: string) {
    return this.repository.remove(id);
  }

  removeMany(ids: string[]) {
    return this.repository.removeMany(ids);
  }

  resolveMany(ids: string[]) {
    return this.repository.resolveMany(ids);
  }

  deductStock(items: ProductStockItemDto[]) {
    return this.repository.deductStock(items);
  }
}
