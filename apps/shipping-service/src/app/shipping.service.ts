import { Inject, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { ShipmentListQueryDto } from './dto/shipment-list-query.dto';
import type { CreateShipmentDto, UpdateShipmentDto } from './dto/shipment.dto';
import { Shipment, type ShipmentItem, type ShipmentInvoice } from './entities/shipment.entity';
import { InvoiceBillingPort } from './integrations/ports/invoice-billing.port';
import { TrackingPort } from './integrations/ports/tracking.port';
import { UserDirectoryPort } from './integrations/ports/user-directory.port';
import { ShippingMongoDBAdapter } from './adapters/shipping-mongodb.adapter';
import type { UpdateShipmentRecord } from './shipping.types';
import { createdShipmentEvent, mergeShipmentEvents, planShipmentInvoices, shipmentUser } from './utils/shipment-data';

type ShippingMongoDBAdapterPort = Pick<
  ShippingMongoDBAdapter,
  'findPage' | 'findOne' | 'create' | 'update' | 'remove' | 'removeMany'
>;

@Injectable()
export class ShippingService {
  constructor(
    @Inject(ShippingMongoDBAdapter)
    private readonly adapter: ShippingMongoDBAdapterPort,
    @Inject(InvoiceBillingPort)
    private readonly invoiceBilling: InvoiceBillingPort,
    @Inject(UserDirectoryPort)
    private readonly userDirectory: UserDirectoryPort,
    @Inject(TrackingPort)
    private readonly tracking: TrackingPort,
  ) {}

  public findPage(query: ShipmentListQueryDto) {
    const { status, ...pageQuery } = query;
    return this.adapter.findPage({
      ...pageQuery,
      ...(status ? { filter: { status } } : {}),
    });
  }

  public findOne(id: string) {
    return this.adapter.findOne(id);
  }

  public async create(dto: CreateShipmentDto) {
    const [invoiceSelection, user] = await Promise.all([
      this.resolveInvoices(dto.invoiceIds),
      this.userDirectory.findUser(dto.createdByUserId),
    ]);
    if (!user.active) {
      throw new UnprocessableEntityException('Inactive users cannot prepare shipments');
    }
    return this.adapter.create(Object.assign(new Shipment(), {
      trackingNumber: `NX-${randomUUID().slice(0, 8).toUpperCase()}`,
      status: 'created',
      recipient: dto.recipient,
      items: invoiceSelection.items,
      invoices: invoiceSelection.invoices,
      createdBy: shipmentUser(user),
      trackingEvents: [createdShipmentEvent(new Date())],
    }));
  }

  public async update(id: string, dto: UpdateShipmentDto) {
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
            createdBy: shipmentUser(user),
          }
        : {}),
    };
    return this.adapter.update(id, update);
  }

  public remove(id: string) {
    return this.adapter.remove(id);
  }

  public removeMany(ids: string[]) {
    return this.adapter.removeMany(ids);
  }

  public async refreshTracking(id: string): Promise<Shipment> {
    const shipment = await this.adapter.findOne(id);
    const tracking = await this.tracking.track(shipment.trackingNumber);
    if (!tracking.events.length) return shipment;
    return this.adapter.update(id, {
      status: tracking.status ?? shipment.status,
      trackingEvents: mergeShipmentEvents(shipment.trackingEvents, tracking.events),
    });
  }

  private async resolveInvoices(
    requestedIds: string[],
  ): Promise<{ invoices: ShipmentInvoice[]; items: ShipmentItem[] }> {
    const ids = [...new Set(requestedIds)];
    const invoices = await this.invoiceBilling.resolveInvoices(ids);
    const selection = planShipmentInvoices(ids, invoices);
    const { missing, unconfirmed } = selection;
    if (missing.length) {
      throw new UnprocessableEntityException({
        message: 'One or more invoices could not be resolved',
        invoiceIds: missing,
      });
    }
    if (unconfirmed.length) {
      throw new UnprocessableEntityException({
        message: 'Only complete invoices can be shipped',
        invoiceIds: unconfirmed,
      });
    }
    return { invoices: selection.invoices, items: selection.items };
  }
}
