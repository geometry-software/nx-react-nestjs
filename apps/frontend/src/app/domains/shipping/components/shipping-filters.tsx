import { Search } from 'lucide-react';
import {
  Card,
  CardContent,
  FilterSelect,
  FormField,
  FormInput,
} from 'geometry-sdk/components';
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
    <Card>
      <CardContent className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <FormInput
          className="w-full lg:w-80"
          label={translate('shipping.searchLabel')}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={translate('shipping.searchPlaceholder')}
          startAdornment={<Search aria-hidden="true" />}
          value={search}
        />
        <div className="flex flex-wrap items-end gap-3">
          <FormField label={translate('shipping.status')}>
            <FilterSelect
              ariaLabel={translate('shipping.status')}
              onChange={(value) => onChange('status', value)}
              options={statusOptions}
              value={query.get('status') ?? ''}
            />
          </FormField>
          <FormField label={translate('common.sort')}>
            <FilterSelect
              ariaLabel={translate('shipping.sortLabel')}
              onChange={(value) => onChange('sort', value)}
              options={sortOptions}
              value={query.get('sort') ?? 'createdAt'}
            />
          </FormField>
          <FormField label={translate('common.rows')}>
            <FilterSelect
              ariaLabel={translate('shipping.pageSize')}
              onChange={(value) => onChange('limit', value)}
              options={['5', '10', '20'].map((value) => ({
                value,
                label: value,
              }))}
              value={query.get('limit') ?? '10'}
            />
          </FormField>
        </div>
      </CardContent>
    </Card>
  );
}
