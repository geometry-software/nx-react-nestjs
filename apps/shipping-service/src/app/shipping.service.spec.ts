import type { CrudListQueryDto } from 'geometry-sdk/adapters';
import { describe, expect, it, vi } from 'vitest';
import type { CreateShipmentDto } from './dto/shipment.dto';
import { ShippingService } from './shipping.service';

describe('ShippingService', () => {
  const repository = {
    findAll: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    removeMany: vi.fn(),
  };
  const invoiceBilling = { resolveInvoices: vi.fn() };
  const userDirectory = { findUser: vi.fn() };
  const tracking = { track: vi.fn() };
  const service = new ShippingService(
    repository,
    invoiceBilling,
    userDirectory,
    tracking,
  );

  it('creates a shipment from trusted product snapshots', async () => {
    const dto: CreateShipmentDto = {
      createdByUserId: 'user-1',
      recipient: {
        name: 'John Smith',
        address: '10 Main Street',
        city: 'Lisbon',
        country: 'Portugal',
      },
      invoiceIds: ['invoice-1'],
    };
    invoiceBilling.resolveInvoices.mockResolvedValue([
      {
        id: 'invoice-1',
        name: 'Office order',
        total: 200,
        status: 'complete',
        items: [
          { productId: 'product-1', name: 'Desk', unitPrice: 100, quantity: 2 },
        ],
      },
    ]);
    userDirectory.findUser.mockResolvedValue({
      id: 'user-1',
      name: 'Jane Manager',
      email: 'jane@example.com',
      role: 'manager',
      active: true,
    });
    tracking.track.mockResolvedValue({ events: [] });
    repository.create.mockImplementation(async (shipment) => shipment);

    await expect(service.create(dto)).resolves.toMatchObject({
      status: 'created',
      recipient: dto.recipient,
      createdBy: {
        userId: 'user-1',
        name: 'Jane Manager',
        email: 'jane@example.com',
        role: 'manager',
      },
      items: [
        { productId: 'product-1', name: 'Desk', quantity: 2, unitPrice: 100 },
      ],
      invoices: [
        { invoiceId: 'invoice-1', name: 'Office order', total: 200 },
      ],
    });
    expect(invoiceBilling.resolveInvoices).toHaveBeenCalledWith(['invoice-1']);
  });

  it('delegates persistence operations to its repository', async () => {
    const query = { page: 1, limit: 10 } as CrudListQueryDto;
    repository.findAll.mockResolvedValue({ data: [], meta: {} });
    repository.remove.mockResolvedValue({ deleted: true });
    repository.removeMany.mockResolvedValue({ deleted: 2 });

    await service.findAll(query);
    await service.remove('shipment-1');
    await service.removeMany(['shipment-1', 'shipment-2']);

    expect(repository.findAll).toHaveBeenCalledWith(query);
    expect(repository.remove).toHaveBeenCalledWith('shipment-1');
    expect(repository.removeMany).toHaveBeenCalledWith([
      'shipment-1',
      'shipment-2',
    ]);
  });
});
