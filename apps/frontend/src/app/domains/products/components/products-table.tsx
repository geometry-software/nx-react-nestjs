import { Package, Pencil, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import {
  Badge,
  Button,
  DataTable,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from 'geometry-sdk/components';
import { tableLabels } from '@/app/utils/i18n-labels';
import { getPageCount } from '@/app/utils/pagination';
import { formatCurrency, formatDateTime } from '@/app/utils/format-value';
import type { Product } from '../models/products.model';
import type { Language } from '@/app/utils/i18n';
import type { Translate } from '@/app/locales/locale';
import type { Page } from '@/app/models/api.model';

export function ProductsTable({
  data,
  language,
  loading,
  onChange,
  onDelete,
  onEdit,
  onSelectedIdsChange,
  query,
  selectedIds,
  translate,
}: {
  data?: Page<Product>;
  language: Language;
  loading: boolean;
  onChange: (key: string, value: string) => void;
  onDelete: (product: Product) => void;
  onEdit: (product: Product) => void;
  onSelectedIdsChange: (ids: Set<string>) => void;
  query: URLSearchParams;
  selectedIds: ReadonlySet<string>;
  translate: Translate;
}) {
  return (
    <DataTable<Product>
      columns={[
        {
          label: translate('products.details'),
          sortValue: (product) => `${product.name} ${product.description}`,
          render: (product) => (
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <Package />
              </span>
              <span className="grid">
                <strong>{product.name}</strong>
                <small className="max-w-96 truncate text-muted-foreground">
                  {product.description}
                </small>
              </span>
            </div>
          ),
        },
        {
          label: translate('products.inventoryId'),
          className: 'w-36',
          sortValue: (product) => product.id,
          render: (product) => (
            <Badge variant="secondary">
              NX-{product.id.slice(-6).toUpperCase()}
            </Badge>
          ),
        },
        {
          label: translate('products.priceUsd'),
          className: 'w-36 font-semibold',
          sortValue: (product) => String(product.price),
          render: (product) => formatCurrency(product.price, language),
        },
        {
          label: translate('products.quantity'),
          className: 'w-28 font-semibold',
          sortValue: (product) => String(product.quantity ?? 0),
          render: (product) => product.quantity ?? 0,
        },
        {
          label: translate('products.createdDate'),
          className: 'w-44 whitespace-nowrap',
          sortValue: (product) => product.createdAt,
          render: (product) => formatDateTime(product.createdAt, language),
        },
        {
          label: translate('products.updatedDate'),
          className: 'w-44 whitespace-nowrap',
          sortValue: (product) => product.updatedAt,
          render: (product) => formatDateTime(product.updatedAt, language),
        },
        {
          label: translate('common.actions'),
          className: 'w-24 text-right',
          render: (product) => (
            <div className="flex justify-end gap-1">
              <ProductAction
                label={translate('common.edit', { name: product.name })}
                onClick={() => onEdit(product)}
              >
                <Pencil />
              </ProductAction>
              <ProductAction
                destructive
                label={translate('common.delete', { name: product.name })}
                onClick={() => onDelete(product)}
              >
                <Trash2 />
              </ProductAction>
            </div>
          ),
        },
      ]}
      itemLabel={translate('products.items')}
      labels={tableLabels(translate)}
      loading={loading}
      onPage={(page) => onChange('page', String(page))}
      onSelectedIdsChange={onSelectedIdsChange}
      page={data?.meta.page ?? 1}
      pages={getPageCount(data?.meta)}
      pageSize={data?.meta.limit ?? Number(query.get('limit') ?? 10)}
      rows={data?.data ?? []}
      selectedIds={selectedIds}
      total={data?.meta.total ?? 0}
    />
  );
}

function ProductAction({
  label,
  destructive,
  onClick,
  children,
}: {
  label: string;
  destructive?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          aria-label={label}
          className={destructive ? 'border-0 focus-visible:border-0' : undefined}
          onClick={onClick}
          size="icon"
          variant={destructive ? 'destructive' : 'ghost'}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
