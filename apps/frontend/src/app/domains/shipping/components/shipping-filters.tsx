import { Filter } from 'geometry-sdk/components';
import type { ShipmentStatus } from '../models/shipping.model';
import type { Translate } from '@/app/locales/locale';

const statusValues: ShipmentStatus[] = [
  'created',
  'in_transit',
  'out_for_delivery',
  'delivered',
  'exception',
  'cancelled',
];

export function ShippingFilters({
  onChange,
  onSearchChange,
  query,
  search,
  translate,
}: {
  onChange: (key: string, value: string) => void;
  onSearchChange: (value: string) => void;
  query: URLSearchParams;
  search: string;
  translate: Translate;
}) {
  const statusOptions = [
    { value: '', label: translate('shipping.allStatuses') },
    ...statusValues.map((status) => ({
      value: status,
      label: translate(`shipping.status.${status}`),
    })),
  ];
  const sortOptions = [
    { value: 'createdAt', label: translate('shipping.createdDate') },
    { value: 'updatedAt', label: translate('shipping.updatedDate') },
    { value: 'trackingNumber', label: translate('shipping.trackingNumber') },
    { value: 'status', label: translate('shipping.status') },
  ];

  return (
    <Filter
      search={{
        label: translate('shipping.searchLabel'),
        placeholder: translate('shipping.searchPlaceholder'),
        value: search,
        onChange: onSearchChange,
      }}
      fields={[
        {
          kind: 'select',
          key: 'status',
          label: translate('shipping.status'),
          ariaLabel: translate('shipping.status'),
          onChange: (value) => onChange('status', value),
          options: statusOptions,
          value: query.get('status') ?? '',
        },
        {
          kind: 'select',
          key: 'sort',
          label: translate('common.sort'),
          ariaLabel: translate('shipping.sortLabel'),
          onChange: (value) => onChange('sort', value),
          options: sortOptions,
          value: query.get('sort') ?? 'createdAt',
        },
        {
          kind: 'select',
          key: 'limit',
          label: translate('common.records'),
          ariaLabel: translate('shipping.pageSize'),
          onChange: (value) => onChange('limit', value),
          options: ['5', '10', '20'].map((value) => ({ value, label: value })),
          value: query.get('limit') ?? '10',
        },
      ]}
    />
  );
}
