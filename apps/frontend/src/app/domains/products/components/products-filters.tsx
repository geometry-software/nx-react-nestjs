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
import type { SortOrder } from '@/app/hooks/use-list-query-params';

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
  const order = query.get('order') ?? 'desc';

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <FormInput
          className="w-full lg:w-80"
          inputId="product-search"
          label={translate('products.searchLabel')}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={translate('products.searchPlaceholder')}
          startAdornment={<Search aria-hidden="true" />}
          value={search}
        />
        <div className="flex flex-wrap items-end gap-3">
          <FormField label={translate('common.sort')}>
            <FilterSelect
              ariaLabel={translate('products.sortLabel')}
              onChange={(value) => onChange('sort', value)}
              options={[
                { value: 'id', label: translate('products.inventoryId') },
                { value: 'createdAt', label: translate('products.createdDate') },
                { value: 'updatedAt', label: translate('products.updatedDate') },
                { value: 'name', label: translate('products.name') },
                { value: 'price', label: translate('products.price') },
                { value: 'quantity', label: translate('products.quantity') },
              ]}
              value={query.get('sort') ?? 'createdAt'}
            />
          </FormField>
          <div
            aria-label={translate('products.direction')}
            className="flex gap-1 rounded-lg border p-1"
          >
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
              ariaLabel={translate('products.pageSize')}
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
