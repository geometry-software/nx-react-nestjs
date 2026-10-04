import { Package, RefreshCw } from 'lucide-react';
import type { ReactNode } from 'react';
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  EntityDialog,
} from 'geometry-sdk/components';
import { formatCurrency, formatDateTime } from '@/app/utils/format-value';
import type { Language } from '@/app/locales/i18n';
import type { Shipment } from '../models/shipping.model';
import type { Translate } from '@/app/locales/locale';

export function ShipmentDetailsDialog({
  description,
  error,
  isRefreshing,
  language,
  onClose,
  onRefresh,
  shipment,
  translate,
}: {
  description: string;
  error: string;
  isRefreshing: boolean;
  language: Language;
  onClose: () => void;
  onRefresh: () => void;
  shipment: Shipment | null;
  translate: Translate;
}) {
  return (
    <EntityDialog
      description={description || undefined}
      onClose={onClose}
      open={Boolean(shipment)}
      title={shipment?.trackingNumber ?? ''}
    >
      {shipment && (
        <div className="grid gap-5">
          {shipment.createdBy && (
            <DetailsSection title={translate('shipping.createdBy')}>
              <div className="rounded-lg border p-3">
                <strong className="block">{shipment.createdBy.name}</strong>
                <small className="text-muted-foreground">
                  {shipment.createdBy.email} · {shipment.createdBy.role}
                </small>
              </div>
            </DetailsSection>
          )}

          <DetailsSection title={translate('shipping.invoices')}>
            <div className="space-y-2">
              {(shipment.invoices ?? []).map((invoice) => (
                <div
                  className="flex items-center justify-between gap-3 rounded-lg border p-3"
                  key={invoice.invoiceId}
                >
                  <strong>{invoice.name}</strong>
                  <Badge variant="secondary">
                    {formatCurrency(invoice.total, language)}
                  </Badge>
                </div>
              ))}
            </div>
          </DetailsSection>

          <DetailsSection title={translate('shipping.products')}>
            <div className="space-y-2">
              {shipment.items.map((item) => (
                <div
                  className="flex items-center gap-3 rounded-lg border p-3"
                  key={item.productId}
                >
                  <Package className="text-primary" />
                  <span className="flex-1">{item.name}</span>
                  <Badge variant="secondary">× {item.quantity}</Badge>
                </div>
              ))}
            </div>
          </DetailsSection>

          <TrackingSection
            language={language}
            shipment={shipment}
            title={translate('shipping.tracker')}
            refreshLabel={translate('shipping.refresh')}
            refreshing={isRefreshing}
            onRefresh={onRefresh}
          />

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </EntityDialog>
  );
}

function DetailsSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-2 font-semibold">{title}</h3>
      {children}
    </section>
  );
}

function TrackingSection({
  shipment,
  language,
  title,
  refreshLabel,
  refreshing,
  onRefresh,
}: {
  shipment: Shipment;
  language: Language;
  title: string;
  refreshLabel: string;
  refreshing: boolean;
  onRefresh: () => void;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="font-semibold">{title}</h3>
        <Button
          loading={refreshing}
          loadingLabel={refreshLabel}
          onClick={onRefresh}
          size="sm"
          variant="outline"
        >
          <RefreshCw />
          {refreshLabel}
        </Button>
      </div>
      <div className="space-y-3 border-l-2 border-primary/20 pl-4">
        {shipment.trackingEvents.map((event) => (
          <div
            className="relative"
            key={`${event.occurredAt}-${event.status}`}
          >
            <span className="absolute -left-[21px] top-1 size-2.5 rounded-full bg-primary" />
            <strong className="block text-sm">{event.status}</strong>
            <small className="text-muted-foreground">
              {event.location ? `${event.location} · ` : ''}
              {formatDateTime(event.occurredAt, language)}
            </small>
          </div>
        ))}
      </div>
    </section>
  );
}
