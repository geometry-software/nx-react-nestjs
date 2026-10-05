import { Injectable } from '@nestjs/common';
import { ExternalHttpClient } from 'geometry-sdk/adapters';
import type {
  ShipmentStatus,
  ShipmentTrackingEvent,
} from '../../entities/shipment.entity';
import { TrackingPort, type TrackingSnapshot } from '../ports/tracking.port';

type DummyPackagePlaceEvent = {
  status?: unknown;
  location?: unknown;
  timestamp?: unknown;
};

@Injectable()
export class DummyPackagePlaceTrackingClient implements TrackingPort {
  constructor(
    private readonly http: ExternalHttpClient,
  ) {}

  async track(trackingNumber: string): Promise<TrackingSnapshot> {
    const payload = await this.http.execute<
      Record<string, unknown>
    >({
      service: 'Dummy Package Place Service',
      url: `https://package.place/api/track/${encodeURIComponent(trackingNumber)}`,
      fallback: {},
      retry: { attempts: 2, baseDelayMs: 250 },
    });
    const providerKey = Object.keys(payload)[0];
    const rawEvents = providerKey ? payload[providerKey] : undefined;
    if (!Array.isArray(rawEvents)) return { events: [] };
    const events = rawEvents.flatMap((item): ShipmentTrackingEvent[] => {
      const event = item as DummyPackagePlaceEvent;
      if (typeof event.status !== 'string') return [];
      return [
        {
          status: event.status,
          ...(typeof event.location === 'string'
            ? { location: event.location }
            : {}),
          occurredAt:
            typeof event.timestamp === 'string'
              ? event.timestamp
              : new Date().toISOString(),
          source: 'dummy-package-place',
        },
      ];
    });
    return {
      status: events[0] ? normalizeStatus(events[0].status) : undefined,
      events,
    };
  }
}

function normalizeStatus(status: string): ShipmentStatus {
  const value = status.toLowerCase();
  if (value.includes('delivered')) return 'delivered';
  if (value.includes('out for delivery')) return 'out_for_delivery';
  if (value.includes('exception') || value.includes('failed')) return 'exception';
  if (value.includes('cancel')) return 'cancelled';
  if (value.includes('transit') || value.includes('facility')) return 'in_transit';
  return 'created';
}
