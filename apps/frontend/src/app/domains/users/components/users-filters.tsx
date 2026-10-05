import { Filter } from 'geometry-sdk/components';
import type { Translate } from '@/app/locales/locale';

export function UsersFilters({
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
  const sortOptions = [
    { value: 'createdAt', label: translate('users.createdDate') },
    { value: 'updatedAt', label: translate('users.updatedDate') },
    { value: 'name', label: translate('users.byName') },
    { value: 'email', label: translate('users.byEmail') },
    { value: 'role', label: translate('users.byRole') },
  ];

  return (
    <Filter
      search={{
        inputId: 'user-search',
        label: translate('users.searchLabel'),
        placeholder: translate('users.searchPlaceholder'),
        value: search,
        onChange: onSearchChange,
      }}
      fields={[
        {
          kind: 'select',
          key: 'sort',
          label: translate('common.sort'),
          ariaLabel: translate('users.sortLabel'),
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
          label: translate('common.show'),
          ariaLabel: translate('users.pageSize'),
          onChange: (value) => onChange('limit', value),
          options: ['5', '10', '20'].map((value) => ({
            value,
            label: translate('users.rows', { count: Number(value) }),
          })),
          value: query.get('limit') ?? '10',
        },
      ]}
    />
  );
}
