import { Inject, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { CrudListQueryDto } from 'geometry-sdk/adapters';
import type { CreateShipmentDto, UpdateShipmentDto } from './dto/shipment.dto';
import type {
  Shipment,
  ShipmentItem,
  ShipmentInvoice,
  ShipmentTrackingEvent,
} from './entities/shipment.entity';
import {
  InvoiceBillingPort,
  type ShippingInvoice,
} from './integrations/ports/invoice-billing.port';
import { TrackingPort } from './integrations/ports/tracking.port';
import { UserDirectoryPort } from './integrations/ports/user-directory.port';
import { ShippingMongoRepository } from './repositories/shipping-mongo.repository';
import type { UpdateShipmentRecord } from './shipping.types';

type ShippingMongoRepositoryPort = Pick<
  ShippingMongoRepository,
  'findAll' | 'findOne' | 'create' | 'update' | 'remove' | 'removeMany'
>;

@Injectable()
export class ShippingService {
  constructor(
    @Inject(ShippingMongoRepository)
    private readonly repository: ShippingMongoRepositoryPort,
    @Inject(InvoiceBillingPort)
    private readonly invoiceBilling: InvoiceBillingPort,
    @Inject(UserDirectoryPort)
    private readonly userDirectory: UserDirectoryPort,
    @Inject(TrackingPort)
    private readonly tracking: TrackingPort,
  ) {}

  findAll(query: CrudListQueryDto) {
    return this.repository.findAll(query);
  }

  findOne(id: string) {
    return this.repository.findOne(id);
  }

  async create(dto: CreateShipmentDto) {
    const [invoiceSelection, user] = await Promise.all([
      this.resolveInvoices(dto.invoiceIds),
      this.userDirectory.findUser(dto.createdByUserId),
    ]);
    if (!user.active) {
      throw new UnprocessableEntityException('Inactive users cannot prepare shipments');
    }
    return this.repository.create({
      trackingNumber: `NX-${randomUUID().slice(0, 8).toUpperCase()}`,
      status: 'created',
      recipient: dto.recipient,
      items: invoiceSelection.items,
      invoices: invoiceSelection.invoices,
      createdBy: {
        userId: String(user.id),
        name: user.name,
        email: user.email,
        role: user.role,
      },
      trackingEvents: [this.createdEvent()],
    });
  }

  async update(id: string, dto: UpdateShipmentDto) {
    const user = dto.createdByUserId
      ? await this.userDirectory.findUser(dto.createdByUserId)
      : undefined;
    const update: UpdateShipmentRecord = {
      ...(dto.recipient ? { recipient: dto.recipient } : {}),
      ...(dto.invoiceIds
        ? await this.resolveInvoices(dto.invoiceIds)
        : {}),
      ...(user
        ? {
            createdBy: {
              userId: String(user.id),
              name: user.name,
              email: user.email,
              role: user.role,
            },
          }
        : {}),
    };
    return this.repository.update(id, update);
  }

  remove(id: string) {
    return this.repository.remove(id);
  }

  removeMany(ids: string[]) {
    return this.repository.removeMany(ids);
  }

  async refreshTracking(id: string): Promise<Shipment> {
    const shipment = await this.repository.findOne(id);
    const tracking = await this.tracking.track(shipment.trackingNumber);
    if (!tracking.events.length) return shipment;
    return this.repository.update(id, {
      status: tracking.status ?? shipment.status,
      trackingEvents: mergeEvents(shipment.trackingEvents, tracking.events),
    });
  }

  private async resolveInvoices(
    requestedIds: string[],
  ): Promise<{ invoices: ShipmentInvoice[]; items: ShipmentItem[] }> {
    const ids = [...new Set(requestedIds)];
    const invoices = await this.invoiceBilling.resolveInvoices(ids);
    const invoicesById = new Map(
      invoices.map((invoice) => [String(invoice.id), invoice]),
    );
    const missing = ids.filter((id) => !invoicesById.has(id));
    if (missing.length) {
      throw new UnprocessableEntityException({
        message: 'One or more invoices could not be resolved',
        invoiceIds: missing,
      });
    }
    const unconfirmed = invoices.filter(
      (invoice) => invoice.status !== 'complete',
    );
    if (unconfirmed.length) {
      throw new UnprocessableEntityException({
        message: 'Only complete invoices can be shipped',
        invoiceIds: unconfirmed.map(({ id }) => id),
      });
    }
    return {
      invoices: invoices.map((invoice) => this.toShipmentInvoice(invoice)),
      items: invoices.flatMap((invoice) =>
        invoice.items.map(({ productId, name, quantity, unitPrice }) => ({
          productId,
          name,
          quantity,
          unitPrice,
        })),
      ),
    };
  }

  private toShipmentInvoice(invoice: ShippingInvoice): ShipmentInvoice {
    return {
      invoiceId: String(invoice.id),
      name: invoice.name,
      total: invoice.total,
    };
  }

  private createdEvent(): ShipmentTrackingEvent {
    return {
      status: 'Shipment created',
      occurredAt: new Date().toISOString(),
      source: 'local',
    };
  }
}

function mergeEvents(
  current: ShipmentTrackingEvent[],
  incoming: ShipmentTrackingEvent[],
): ShipmentTrackingEvent[] {
  const events = new Map<string, ShipmentTrackingEvent>();
  [...current, ...incoming].forEach((event) => {
    events.set(`${event.occurredAt}:${event.status}:${event.location ?? ''}`, event);
  });
  return [...events.values()].sort((left, right) =>
    right.occurredAt.localeCompare(left.occurredAt),
  );
}
