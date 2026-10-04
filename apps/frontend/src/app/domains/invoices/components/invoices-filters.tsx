import { Search } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  FilterSelect,
  FormField,
  FormInput,
} from 'geometry-sdk/components';
import type { InvoiceStatus } from '../models/invoices.model';
import type { Translate } from '@/app/locales/locale';

export function InvoicesFilters({
  onChange,
  onOrderChange,
  onSearchChange,
  query,
  search,
  translate,
}: {
  onChange: (key: string, value: string) => void;
  onOrderChange: (order: 'asc' | 'desc') => void;
  onSearchChange: (value: string) => void;
  query: URLSearchParams;
  search: string;
  translate: Translate;
}) {
  const order = query.get('order') ?? 'desc';
  const statusOptions = [
    { value: 'all', label: translate('invoices.allStatuses') },
    ...(['pending', 'complete', 'rejected'] as InvoiceStatus[]).map(
      (status) => ({
        value: status,
        label: translate(`invoices.status.${status}`),
      }),
    ),
  ];
  const sortOptions = [
    { value: 'createdAt', label: translate('invoices.createdDate') },
    { value: 'updatedAt', label: translate('invoices.updatedDate') },
    { value: 'name', label: translate('invoices.name') },
    { value: 'status', label: translate('invoices.status') },
    { value: 'total', label: translate('invoices.total') },
  ];

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <FormInput
          className="w-full lg:w-80"
          label={translate('invoices.searchLabel')}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={translate('invoices.searchPlaceholder')}
          startAdornment={<Search aria-hidden="true" />}
          value={search}
        />
        <div className="flex flex-wrap items-end gap-3">
          <FormField label={translate('invoices.status')}>
            <FilterSelect
              ariaLabel={translate('invoices.status')}
              onChange={(value) =>
                onChange('status', value === 'all' ? '' : value)
              }
              options={statusOptions}
              value={query.get('status') ?? 'all'}
            />
          </FormField>
          <FormField label={translate('common.sort')}>
            <FilterSelect
              ariaLabel={translate('invoices.sortLabel')}
              onChange={(value) => onChange('sort', value)}
              options={sortOptions}
              value={query.get('sort') ?? 'createdAt'}
            />
          </FormField>
          <div className="flex gap-1 rounded-lg border p-1">
            <Button
              onClick={() => onOrderChange('desc')}
              size="sm"
              variant={order === 'desc' ? 'default' : 'ghost'}
            >
              {translate('common.desc')}
            </Button>
            <Button
              onClick={() => onOrderChange('asc')}
              size="sm"
              variant={order === 'asc' ? 'default' : 'ghost'}
            >
              {translate('common.asc')}
            </Button>
          </div>
          <FormField label={translate('common.rows')}>
            <FilterSelect
              ariaLabel={translate('invoices.pageSize')}
              className="min-w-20"
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
