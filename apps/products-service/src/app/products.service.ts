import { Inject, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import type { ProductStockItemDto } from './dto/deduct-product-stock.dto';
import type { ProductListQueryDto } from './dto/product-list-query.dto';
import { ProductMongoDBAdapter } from './adapters/product-mongodb.adapter';
import { Product } from './entities/product.entity';
import { planProductStockDeduction, requestedProductStock } from './utils/product-stock';

type ProductMongoDBAdapterPort = Pick<
  ProductMongoDBAdapter,
  | 'findPage'
  | 'findOne'
  | 'create'
  | 'update'
  | 'remove'
  | 'removeMany'
  | 'query'
>;

@Injectable()
export class ProductsService {
  constructor(
    @Inject(ProductMongoDBAdapter)
    private readonly adapter: ProductMongoDBAdapterPort,
  ) {}

  public findPage(query: ProductListQueryDto) {
    const { active, ...pageQuery } = query;
    return this.adapter.findPage({
      ...pageQuery,
      ...(active === undefined ? {} : { filter: { active: active === 'true' } }),
    });
  }

  public findOne(id: string) {
    return this.adapter.findOne(id);
  }
  public create(dto: CreateProductDto) {
    return this.adapter.create(Object.assign(new Product(), {
      ...dto,
      description: dto.description ?? '',
      active: dto.active ?? true,
    }));
  }
  public update(id: string, dto: UpdateProductDto) {
    return this.adapter.update(id, dto);
  }
  public remove(id: string) {
    return this.adapter.remove(id);
  }

  public removeMany(ids: string[]) {
    return this.adapter.removeMany(ids);
  }

  public resolveMany(ids: string[]) {
    return this.adapter.query(JSON.stringify({ _id: { $in: ids.map((id) => ({ $oid: id })) } }));
  }

  public async deductStock(items: ProductStockItemDto[]) {
    const requested = requestedProductStock(items);
    const products = await this.resolveMany([...requested.keys()]);
    const { updates, unavailable } = planProductStockDeduction(requested, products);
    if (unavailable.length) {
      throw new UnprocessableEntityException({
        message: 'Insufficient product quantity',
        products: unavailable,
      });
    }
    return Promise.all(updates.map(({ id, quantity }) => this.adapter.update(id, { quantity })));
  }
}
