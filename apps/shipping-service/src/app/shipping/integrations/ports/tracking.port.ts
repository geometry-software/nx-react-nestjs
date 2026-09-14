import type {
  ShipmentStatus,
  ShipmentTrackingEvent,
} from '../../entities/shipment.entity';

export type TrackingSnapshot = {
  status?: ShipmentStatus;
  events: ShipmentTrackingEvent[];
};

export abstract class TrackingPort {
  abstract track(trackingNumber: string): Promise<TrackingSnapshot>;
}
