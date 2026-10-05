import { Filter } from 'geometry-sdk/components';
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
    <Filter
      search={{
        label: translate('invoices.searchLabel'),
        placeholder: translate('invoices.searchPlaceholder'),
        value: search,
        onChange: onSearchChange,
      }}
      fields={[
        {
          kind: 'select',
          key: 'status',
          label: translate('invoices.status'),
          ariaLabel: translate('invoices.status'),
          onChange: (value) => onChange('status', value === 'all' ? '' : value),
          options: statusOptions,
          value: query.get('status') ?? 'all',
        },
        {
          kind: 'select',
          key: 'sort',
          label: translate('common.sort'),
          ariaLabel: translate('invoices.sortLabel'),
          onChange: (value) => onChange('sort', value),
          options: sortOptions,
          value: query.get('sort') ?? 'createdAt',
        },
        {
          kind: 'order',
          key: 'order',
          label: translate('common.order'),
          value: query.get('order') === 'asc' ? 'asc' : 'desc',
          ascendingLabel: translate('common.asc'),
          descendingLabel: translate('common.desc'),
          onChange: onOrderChange,
        },
        {
          kind: 'select',
          key: 'limit',
          label: translate('common.records'),
          ariaLabel: translate('invoices.pageSize'),
          className: 'min-w-20',
          onChange: (value) => onChange('limit', value),
          options: ['5', '10', '20'].map((value) => ({ value, label: value })),
          value: query.get('limit') ?? '10',
        },
      ]}
    />
  );
}
