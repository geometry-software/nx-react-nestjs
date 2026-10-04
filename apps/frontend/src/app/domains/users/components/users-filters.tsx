import { Search } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  FilterSelect,
  FormField,
  FormInput,
} from 'geometry-sdk/components';
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
  const order = query.get('order') ?? 'desc';
  const sortOptions = [
    { value: 'createdAt', label: translate('users.createdDate') },
    { value: 'updatedAt', label: translate('users.updatedDate') },
    { value: 'name', label: translate('users.byName') },
    { value: 'email', label: translate('users.byEmail') },
    { value: 'role', label: translate('users.byRole') },
  ];

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <FormInput
          className="w-full lg:w-80"
          inputId="user-search"
          label={translate('users.searchLabel')}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={translate('users.searchPlaceholder')}
          startAdornment={<Search aria-hidden="true" />}
          value={search}
        />
        <div className="flex flex-wrap items-end gap-3">
          <FormField label={translate('common.sort')}>
            <FilterSelect
              ariaLabel={translate('users.sortLabel')}
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
          <FormField label={translate('common.show')}>
            <FilterSelect
              ariaLabel={translate('users.pageSize')}
              onChange={(value) => onChange('limit', value)}
              options={['5', '10', '20'].map((value) => ({
                value,
                label: translate('users.rows', { count: Number(value) }),
              }))}
              value={query.get('limit') ?? '10'}
            />
          </FormField>
        </div>
      </CardContent>
    </Card>
  );
}
