import { describe, expect, it, vi } from 'vitest';
import type { CreateInvoiceDto } from './dto/invoice.dto';
import { InvoicesService } from './invoices.service';

describe('InvoicesService', () => {
  const repository = {
    findAll: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  };
  const products = {
    resolveProducts: vi.fn(),
    deductStock: vi.fn(),
  };
  const service = new InvoicesService(repository, products);

  it('creates a pending invoice from repository-independent product snapshots', async () => {
    const dto: CreateInvoiceDto = {
      name: 'Office order',
      description: 'September equipment',
      items: [{ productId: 'product-1', quantity: 2 }],
    };
    products.resolveProducts.mockResolvedValue([
      {
        id: 'product-1',
        name: 'Desk',
        description: 'Standing desk',
        price: 100,
        quantity: 8,
        active: true,
      },
    ]);
    repository.create.mockImplementation(async (record) => ({
      id: 'invoice-1',
      ...record,
    }));

    await expect(service.create(dto)).resolves.toMatchObject({
      name: 'Office order',
      status: 'pending',
      total: 200,
      items: [
        {
          productId: 'product-1',
          name: 'Desk',
          unitPrice: 100,
          quantity: 2,
        },
      ],
    });
    expect(products.resolveProducts).toHaveBeenCalledWith(['product-1']);
  });

  it('confirms a pending invoice only after product stock is deducted', async () => {
    const invoice = {
      id: 'invoice-1',
      status: 'pending',
      items: [{ productId: 'product-1', quantity: 2 }],
    };
    repository.findOne.mockResolvedValue(invoice);
    repository.update.mockResolvedValue({ ...invoice, status: 'complete' });

    await expect(service.confirm('invoice-1')).resolves.toMatchObject({
      status: 'complete',
    });
    expect(products.deductStock).toHaveBeenCalledWith([
      { productId: 'product-1', quantity: 2 },
    ]);
    expect(repository.update).toHaveBeenCalledWith('invoice-1', {
      status: 'complete',
    });
  });
});

