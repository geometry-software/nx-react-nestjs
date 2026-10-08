import type {
  ShipmentInvoice,
  ShipmentItem,
  ShipmentTrackingEvent,
  ShipmentUser,
} from '../entities/shipment.entity';
import type { ShippingInvoice } from '../integrations/ports/invoice-billing.port';
import type { DirectoryUser } from '../integrations/ports/user-directory.port';

export function planShipmentInvoices(
  requestedIds: readonly string[],
  invoices: readonly ShippingInvoice[],
): {
  missing: string[];
  unconfirmed: string[];
  invoices: ShipmentInvoice[];
  items: ShipmentItem[];
} {
  const invoicesById = new Map(invoices.map((invoice) => [invoice.id, invoice]));
  return {
    missing: requestedIds.filter((id) => !invoicesById.has(id)),
    unconfirmed: invoices.filter((invoice) => invoice.status !== 'complete').map(({ id }) => id),
    invoices: invoices.map((invoice) => ({
      invoiceId: invoice.id,
      name: invoice.name,
      total: invoice.total,
    })),
    items: invoices.flatMap((invoice) =>
      invoice.items.map(({ productId, name, quantity, unitPrice }) => ({
        productId,
        name,
        quantity,
        unitPrice,
      }))),
  };
}

export function shipmentUser(user: DirectoryUser): ShipmentUser {
  return {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export function createdShipmentEvent(now: Date): ShipmentTrackingEvent {
  return {
    status: 'Shipment created',
    occurredAt: now.toISOString(),
    source: 'local',
  };
}

export function mergeShipmentEvents(
  current: readonly ShipmentTrackingEvent[],
  incoming: readonly ShipmentTrackingEvent[],
): ShipmentTrackingEvent[] {
  const events = new Map<string, ShipmentTrackingEvent>();
  for (const event of [...current, ...incoming]) {
    events.set(`${event.occurredAt}:${event.status}:${event.location ?? ''}`, event);
  }
  return [...events.values()].sort((left, right) =>
    right.occurredAt.localeCompare(left.occurredAt));
}
