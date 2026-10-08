import { Route, Trash2 } from 'lucide-react';
import { Badge, Button, DataTable } from 'geometry-sdk/components';
import { tableLabels } from '@/app/utils/i18n-labels';
import { getPageCount } from '@/app/utils/pagination';
import { formatDateTime } from '@/app/utils/format-value';
import type { Shipment } from '../models/shipping.model';
import type { Page } from '@/app/models/api.model';
import type { Language } from '@/app/utils/i18n';
import type { Translate } from '@/app/locales/locale';

export function ShippingTable({
  data,
  language,
  loading,
  onDelete,
  onOpenDetails,
  onPageChange,
  onSelectedIdsChange,
  pageSize,
  selectedIds,
  translate,
}: {
  data?: Page<Shipment>;
  language: Language;
  loading: boolean;
  onDelete: (shipment: Shipment) => void;
  onOpenDetails: (shipment: Shipment) => void;
  onPageChange: (page: number) => void;
  onSelectedIdsChange: (ids: Set<string>) => void;
  pageSize: number;
  selectedIds: ReadonlySet<string>;
  translate: Translate;
}) {
  const columns = [
    {
      label: translate('shipping.trackingNumber'),
      sortValue: (shipment: Shipment) => shipment.trackingNumber,
      render: (shipment: Shipment) => (
        <span className="font-semibold">{shipment.trackingNumber}</span>
      ),
    },
    {
      label: translate('shipping.recipient'),
      sortValue: (shipment: Shipment) =>
        `${shipment.recipient.name} ${shipment.recipient.city} ${shipment.recipient.country}`,
      render: (shipment: Shipment) => (
        <span className="grid">
          <strong>{shipment.recipient.name}</strong>
          <small className="text-muted-foreground">
            {shipment.recipient.city}, {shipment.recipient.country}
          </small>
        </span>
      ),
    },
    {
      label: translate('shipping.invoices'),
      sortValue: (shipment: Shipment) =>
        String(shipment.invoices?.length ?? 0),
      render: (shipment: Shipment) =>
        translate('shipping.invoiceCount', {
          count: shipment.invoices?.length ?? 0,
        }),
    },
    {
      label: translate('shipping.createdBy'),
      sortValue: (shipment: Shipment) => shipment.createdBy?.name ?? '',
      render: (shipment: Shipment) => shipment.createdBy?.name ?? '—',
    },
    {
      label: translate('shipping.status'),
      sortValue: (shipment: Shipment) => shipment.status,
      render: (shipment: Shipment) => (
        <Badge
          variant={
            shipment.status === 'delivered' ? 'default' : 'secondary'
          }
        >
          {translate(`shipping.status.${shipment.status}`)}
        </Badge>
      ),
    },
    {
      label: translate('shipping.updatedDate'),
      className: 'whitespace-nowrap',
      sortValue: (shipment: Shipment) => shipment.updatedAt,
      render: (shipment: Shipment) =>
        formatDateTime(shipment.updatedAt, language),
    },
    {
      label: translate('common.actions'),
      className: 'w-24 text-right',
      render: (shipment: Shipment) => {
        const trackingLabel = translate('shipping.viewTracking', {
          name: shipment.trackingNumber,
        });

        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              aria-label={trackingLabel}
              className="text-primary"
              onClick={() => onOpenDetails(shipment)}
              size="icon"
              title={trackingLabel}
              variant="ghost"
            >
              <Route />
            </Button>
            <Button
              aria-label={translate('common.delete', {
                name: shipment.trackingNumber,
              })}
              className="border-0 focus-visible:border-0"
              onClick={() => onDelete(shipment)}
              size="icon"
              variant="destructive"
            >
              <Trash2 />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <DataTable<Shipment>
      columns={columns}
      itemLabel={translate('shipping.items')}
      labels={tableLabels(translate)}
      loading={loading}
      onPage={onPageChange}
      onSelectedIdsChange={onSelectedIdsChange}
      page={data?.meta.page ?? 1}
      pages={getPageCount(data?.meta)}
      pageSize={data?.meta.limit ?? pageSize}
      rows={data?.data ?? []}
      selectedIds={selectedIds}
      total={data?.meta.total ?? 0}
    />
  );
}
