import {
  Inject,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  CollectionCrudRepository,
  getMongoProviderConnectionToken,
  MongoCollectionProviderAdapter,
  type MongoProviderConnection,
} from 'geometry-sdk/adapters';
import { CreateProductDto, UpdateProductDto } from '../dto/product.dto';
import { Product } from '../entities/product.entity';
import type { ProductStockItemDto } from '../dto/deduct-product-stock.dto';

@Injectable()
export class ProductMongoProviderRepository extends CollectionCrudRepository<
  Product,
  CreateProductDto,
  UpdateProductDto
> {
  private readonly provider: MongoCollectionProviderAdapter<Product, CreateProductDto, UpdateProductDto>;

  constructor(@Inject(getMongoProviderConnectionToken('products')) connection: MongoProviderConnection) {
    const provider = new MongoCollectionProviderAdapter<Product, CreateProductDto, UpdateProductDto>(connection, 'products', {
      entityName: Product.name,
      searchableFields: ['name', 'description'],
      sortableFields: ['id', 'createdAt', 'updatedAt', 'price', 'quantity', 'name'],
      defaultSort: 'createdAt',
    });
    super(provider);
    this.provider = provider;
  }

  override create(dto: CreateProductDto): Promise<Product> {
    return super.create({
      ...dto,
      description: dto.description ?? '',
      active: dto.active ?? true,
      quantity: dto.quantity,
    });
  }

  resolveMany(ids: string[]): Promise<Product[]> {
    return this.execute(() => this.provider.findByIds(ids));
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
        return this.update(String(product.id), {
          quantity: product.quantity - (requested.get(String(product.id)) ?? 0),
        });
      }),
    );
  }
}
