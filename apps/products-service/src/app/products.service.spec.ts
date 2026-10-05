import type { CrudListQueryDto } from 'geometry-sdk/adapters';
import { describe, expect, it, vi } from 'vitest';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  const repository = {
    findAll: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    removeMany: vi.fn(),
    resolveMany: vi.fn(),
    deductStock: vi.fn(),
  };
  const service = new ProductsService(repository);

  it('delegates list queries to the domain repository', async () => {
    const query = { page: 2, limit: 5, sort: 'price', order: 'asc' } as CrudListQueryDto;
    const result = { data: [], meta: { page: 2, limit: 5, total: 0, totalPages: 1 } };
    repository.findAll.mockResolvedValue(result);

    await expect(service.findAll(query)).resolves.toBe(result);
    expect(repository.findAll).toHaveBeenCalledWith(query);
  });

  it('delegates create, update, read and delete operations', async () => {
    const createDto = { name: 'Desk', price: 100, quantity: 10 } as CreateProductDto;
    const updateDto = { price: 120 } as UpdateProductDto;
    const product = { id: 'product-1', ...createDto };
    repository.create.mockResolvedValue(product);
    repository.findOne.mockResolvedValue(product);
    repository.update.mockResolvedValue({ ...product, price: 120 });
    repository.remove.mockResolvedValue({ deleted: true });
    repository.removeMany.mockResolvedValue({ deleted: 2 });
    repository.resolveMany.mockResolvedValue([product]);
    repository.deductStock.mockResolvedValue([{ ...product, quantity: 8 }]);

    await expect(service.create(createDto)).resolves.toBe(product);
    await expect(service.findOne('product-1')).resolves.toBe(product);
    await expect(service.update('product-1', updateDto)).resolves.toMatchObject({ price: 120 });
    await expect(service.remove('product-1')).resolves.toEqual({ deleted: true });
    await expect(
      service.removeMany(['product-1', 'product-2']),
    ).resolves.toEqual({ deleted: 2 });
    await expect(service.resolveMany(['product-1'])).resolves.toEqual([
      product,
    ]);
    await expect(
      service.deductStock([{ productId: 'product-1', quantity: 2 }]),
    ).resolves.toEqual([{ ...product, quantity: 8 }]);

    expect(repository.create).toHaveBeenCalledWith(createDto);
    expect(repository.findOne).toHaveBeenCalledWith('product-1');
    expect(repository.update).toHaveBeenCalledWith('product-1', updateDto);
    expect(repository.remove).toHaveBeenCalledWith('product-1');
    expect(repository.removeMany).toHaveBeenCalledWith([
      'product-1',
      'product-2',
    ]);
    expect(repository.resolveMany).toHaveBeenCalledWith(['product-1']);
    expect(repository.deductStock).toHaveBeenCalledWith([
      { productId: 'product-1', quantity: 2 },
    ]);
  });
});
