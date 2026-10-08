import { Inject, Injectable } from '@nestjs/common';
import {
  type MongoDbNativeProviderAdapter,
  type MongoCollectionAdapterQuery,
  type PageableCollectionAdapter,
  type PaginatedResult,
} from 'geometry-sdk/adapters';
import { CreateProductDto, UpdateProductDto } from '../dto/product.dto';
import { productsMongoProviderConfiguration } from '../providers/products-mongo.provider';
import { Product } from '../entities/product.entity';

@Injectable()
export class ProductMongoDBAdapter implements PageableCollectionAdapter<
  Product, UpdateProductDto, MongoCollectionAdapterQuery, PaginatedResult<Product>
> {
  constructor(
    @Inject(productsMongoProviderConfiguration.collections[0].token)
    private readonly adapter: MongoDbNativeProviderAdapter<Product, CreateProductDto, UpdateProductDto>,
  ) {}

  public getSource(): string {
    return this.adapter.getSource();
  }

  public setSource(source: string): void {
    this.adapter.setSource(source);
  }

  public findAll(): Promise<Product[]> {
    return this.adapter.findAll();
  }

  public findPage(request: MongoCollectionAdapterQuery): Promise<PaginatedResult<Product>> {
    return this.adapter.findPage(request);
  }

  public query(expression: string): Promise<Product[]> {
    return this.adapter.query(expression);
  }

  public findOne(id: string): Promise<Product> {
    return this.adapter.findOne(id);
  }

  public create(value: Product): Promise<Product> {
    return this.adapter.create(value);
  }

  public update(id: string, value: UpdateProductDto): Promise<Product> {
    return this.adapter.update(id, value);
  }

  public remove(id: string): Promise<{ deleted: true }> {
    return this.adapter.remove(id);
  }

  public removeMany(ids: string[]): Promise<{ deleted: number }> {
    return this.adapter.removeMany(ids);
  }
}
