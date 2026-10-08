import { describe, expect, it, vi } from 'vitest';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import type { ProductListQueryDto } from './dto/product-list-query.dto';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  const productId = '507f1f77bcf86cd799439011';
  const adapter = {
    findPage: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    removeMany: vi.fn(),
    query: vi.fn(),
  };
  const service = new ProductsService(adapter);

  it('delegates list queries to the domain adapter', async () => {
    const query = { page: 2, limit: 5, sort: 'price', order: 'asc', active: 'true' } as ProductListQueryDto;
    const result = { data: [], meta: { page: 2, limit: 5, total: 0 } };
    adapter.findPage.mockResolvedValue(result);

    await expect(service.findPage(query)).resolves.toBe(result);
    expect(adapter.findPage).toHaveBeenCalledWith({
      page: 2,
      limit: 5,
      sort: 'price',
      order: 'asc',
      filter: { active: true },
    });
  });

  it('delegates create, update, read and delete operations', async () => {
    const createDto = { name: 'Desk', price: 100, quantity: 10 } as CreateProductDto;
    const updateDto = { price: 120 } as UpdateProductDto;
    const product = { id: productId, ...createDto };
    adapter.create.mockResolvedValue(product);
    adapter.findOne.mockResolvedValue(product);
    adapter.update.mockResolvedValue({ ...product, price: 120 });
    adapter.remove.mockResolvedValue({ deleted: true });
    adapter.removeMany.mockResolvedValue({ deleted: 2 });
    adapter.query.mockResolvedValue([product]);

    await expect(service.create(createDto)).resolves.toBe(product);
    await expect(service.findOne(productId)).resolves.toBe(product);
    await expect(service.update(productId, updateDto)).resolves.toMatchObject({ price: 120 });
    await expect(service.remove(productId)).resolves.toEqual({ deleted: true });
    await expect(
      service.removeMany([productId, 'product-2']),
    ).resolves.toEqual({ deleted: 2 });
    await expect(service.resolveMany([productId])).resolves.toEqual([
      product,
    ]);
    expect(adapter.create).toHaveBeenCalledWith({ ...createDto, description: '', active: true });
    expect(adapter.findOne).toHaveBeenCalledWith(productId);
    expect(adapter.update).toHaveBeenCalledWith(productId, updateDto);
    expect(adapter.remove).toHaveBeenCalledWith(productId);
    expect(adapter.removeMany).toHaveBeenCalledWith([
      productId,
      'product-2',
    ]);
    expect(adapter.query).toHaveBeenCalledWith(JSON.stringify({ _id: { $in: [{ $oid: productId }] } }));
  });

  it('aggregates stock requests before updating products', async () => {
    const product = { id: productId, quantity: 10 };
    adapter.query.mockResolvedValue([product]);
    adapter.update.mockResolvedValue({ ...product, quantity: 5 });

    await expect(service.deductStock([
      { productId: productId, quantity: 2 },
      { productId: productId, quantity: 3 },
    ])).resolves.toEqual([{ ...product, quantity: 5 }]);

    expect(adapter.query).toHaveBeenCalledWith(JSON.stringify({ _id: { $in: [{ $oid: productId }] } }));
    expect(adapter.update).toHaveBeenCalledWith(productId, { quantity: 5 });
  });

  it('rejects unavailable stock before updating any product', async () => {
    adapter.query.mockResolvedValue([{ id: productId, quantity: 1 }]);
    adapter.update.mockClear();

    await expect(service.deductStock([
      { productId: productId, quantity: 2 },
    ])).rejects.toMatchObject({
      response: {
        message: 'Insufficient product quantity',
        products: [{ productId: productId, requested: 2, available: 1 }],
      },
    });
    expect(adapter.update).not.toHaveBeenCalled();
  });
});
