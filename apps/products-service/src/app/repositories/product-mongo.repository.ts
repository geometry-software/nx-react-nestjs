import {
  BadRequestException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoCrudRepository } from 'geometry-sdk/adapters';
import { ObjectId } from 'mongodb';
import { MongoRepository, type DeepPartial } from 'typeorm';
import { CreateProductDto, UpdateProductDto } from '../dto/product.dto';
import { Product } from '../entities/product.entity';
import type { ProductStockItemDto } from '../dto/deduct-product-stock.dto';

@Injectable()
export class ProductMongoRepository extends MongoCrudRepository<
  Product,
  CreateProductDto,
  UpdateProductDto
> {
  constructor(@InjectRepository(Product) repository: MongoRepository<Product>) {
    super(repository, {
      entityName: Product.name,
      searchableFields: ['name', 'description'],
      sortableFields: ['id', 'createdAt', 'updatedAt', 'price', 'quantity', 'name'],
      sortFieldMap: { id: '_id' },
      defaultSort: 'createdAt',
    });
  }

  protected mapCreateDto(dto: CreateProductDto): DeepPartial<Product> {
    return {
      ...dto,
      description: dto.description ?? '',
      active: dto.active ?? true,
      quantity: dto.quantity,
    };
  }

  resolveMany(ids: string[]): Promise<Product[]> {
    if (ids.some((id) => !ObjectId.isValid(id))) {
      throw new BadRequestException('One or more product ids are invalid');
    }
    return this.repository
      .createEntityCursor({
        _id: { $in: ids.map((id) => new ObjectId(id)) },
      })
      .toArray();
  }

  async deductStock(items: ProductStockItemDto[]): Promise<Product[]> {
    const requested = new Map<string, number>();
    items.forEach(({ productId, quantity }) =>
      requested.set(productId, (requested.get(productId) ?? 0) + quantity),
    );
    const products = await this.resolveMany([...requested.keys()]);
    const productsById = new Map(
      products.map((product) => [String(product.id), product]),
    );
    const unavailable = [...requested].flatMap(([productId, quantity]) => {
      const product = productsById.get(productId);
      const available = product?.quantity ?? 0;
      return !product || available < quantity
        ? [{ productId, requested: quantity, available }]
        : [];
    });
    if (unavailable.length) {
      throw new UnprocessableEntityException({
        message: 'Insufficient product quantity',
        products: unavailable,
      });
    }
    return Promise.all(
      products.map((product) => {
        product.quantity -= requested.get(String(product.id)) ?? 0;
        product.updatedAt = new Date();
        return this.repository.save(product);
      }),
    );
  }
}
