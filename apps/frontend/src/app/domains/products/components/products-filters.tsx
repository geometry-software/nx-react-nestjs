import { Filter, type SortOrder } from 'geometry-sdk/components';
import type { Translate } from '@/app/locales/locale';

export function ProductsFilters({
  onChange,
  onOrderChange,
  onSearchChange,
  query,
  search,
  translate,
}: {
  onChange: (key: string, value: string) => void;
  onOrderChange: (order: SortOrder) => void;
  onSearchChange: (value: string) => void;
  query: URLSearchParams;
  search: string;
  translate: Translate;
}) {
  return (
    <Filter
      search={{
        inputId: 'product-search',
        label: translate('products.searchLabel'),
        placeholder: translate('products.searchPlaceholder'),
        value: search,
        onChange: onSearchChange,
      }}
      fields={[
        {
          kind: 'select',
          key: 'sort',
          label: translate('common.sort'),
          ariaLabel: translate('products.sortLabel'),
          onChange: (value) => onChange('sort', value),
          options: [
            { value: 'id', label: translate('products.inventoryId') },
            { value: 'createdAt', label: translate('products.createdDate') },
            { value: 'updatedAt', label: translate('products.updatedDate') },
            { value: 'name', label: translate('products.name') },
            { value: 'price', label: translate('products.price') },
            { value: 'quantity', label: translate('products.quantity') },
          ],
          value: query.get('sort') ?? 'createdAt',
        },
        {
          kind: 'order',
          key: 'order',
          label: translate('common.order'),
          ariaLabel: translate('products.direction'),
          value: query.get('order') === 'asc' ? 'asc' : 'desc',
          ascendingLabel: translate('common.asc'),
          descendingLabel: translate('common.desc'),
          onChange: onOrderChange,
        },
        {
          kind: 'select',
          key: 'limit',
          label: translate('common.records'),
          ariaLabel: translate('products.pageSize'),
          className: 'min-w-20',
          onChange: (value) => onChange('limit', value),
          options: ['5', '10', '20'].map((value) => ({ value, label: value })),
          value: query.get('limit') ?? '10',
        },
      ]}
    />
  );
}
