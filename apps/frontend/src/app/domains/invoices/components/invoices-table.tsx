import { Ban, CheckCircle2, FileCheck2, Pencil, Printer } from 'lucide-react';
import type { ReactNode } from 'react';
import {
  Button,
  DataTable,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from 'geometry-sdk/components';
import { tableLabels } from '@/app/utils/i18n-labels';
import { formatCurrency, formatDateTime } from '@/app/utils/format-value';
import type { Invoice } from '../models/invoices.model';
import type { Page } from '@/app/models/api.model';
import type { Language } from '@/app/utils/i18n';
import type { Translate } from '@/app/locales/locale';
import { InvoiceStatusBadge } from './invoice-formatters';

export function InvoicesTable({
  data,
  language,
  loading,
  onCancel,
  onConfirm,
  onEdit,
  onPageChange,
  onPrint,
  pageSize,
  translate,
}: {
  data?: Page<Invoice>;
  language: Language;
  loading: boolean;
  onCancel: (invoice: Invoice) => void;
  onConfirm: (invoice: Invoice) => void;
  onEdit: (invoice: Invoice) => void;
  onPageChange: (page: number) => void;
  onPrint: (invoice: Invoice) => void;
  pageSize: number;
  translate: Translate;
}) {
  const columns = [
    {
      label: translate('invoices.details'),
      sortValue: (invoice: Invoice) =>
        `${invoice.name} ${invoice.description ?? ''}`,
      render: (invoice: Invoice) => (
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
            <FileCheck2 />
          </span>
          <span className="grid">
            <strong>{invoice.name}</strong>
            <small className="max-w-64 truncate text-muted-foreground">
              {invoice.description || translate('invoices.noDescription')}
            </small>
          </span>
        </div>
      ),
    },
    {
      label: translate('invoices.total'),
      className: 'w-32 font-semibold',
      sortValue: (invoice: Invoice) => String(invoice.total),
      render: (invoice: Invoice) => formatCurrency(invoice.total, language),
    },
    {
      label: translate('invoices.status'),
      className: 'w-28',
      sortValue: (invoice: Invoice) => invoice.status,
      render: (invoice: Invoice) => (
        <InvoiceStatusBadge status={invoice.status}>
          {translate(`invoices.status.${invoice.status}`)}
        </InvoiceStatusBadge>
      ),
    },
    {
      label: translate('invoices.createdDate'),
      className: 'w-40 whitespace-nowrap',
      sortValue: (invoice: Invoice) => invoice.createdAt,
      render: (invoice: Invoice) => formatDateTime(invoice.createdAt, language),
    },
    {
      label: translate('invoices.updatedDate'),
      className: 'w-40 whitespace-nowrap',
      sortValue: (invoice: Invoice) => invoice.updatedAt,
      render: (invoice: Invoice) => formatDateTime(invoice.updatedAt, language),
    },
    {
      label: '',
      className: 'w-44',
      render: (invoice: Invoice) => (
        <div className="flex justify-end gap-1">
          <InvoiceAction
            disabled={invoice.status !== 'pending'}
            label={translate('invoices.edit', { name: invoice.name })}
            onClick={() => onEdit(invoice)}
          >
            <Pencil />
          </InvoiceAction>
          <InvoiceAction
            label={translate('invoices.print', { name: invoice.name })}
            onClick={() => onPrint(invoice)}
          >
            <Printer />
          </InvoiceAction>
          <InvoiceAction
            disabled={invoice.status !== 'pending'}
            label={translate('invoices.confirm', { name: invoice.name })}
            onClick={() => onConfirm(invoice)}
          >
            <CheckCircle2 />
          </InvoiceAction>
          <InvoiceAction
            destructive
            disabled={invoice.status !== 'pending'}
            label={translate('invoices.cancel', { name: invoice.name })}
            onClick={() => onCancel(invoice)}
          >
            <Ban />
          </InvoiceAction>
        </div>
      ),
    },
  ];

  return (
    <DataTable<Invoice>
      columns={columns}
      itemLabel={translate('invoices.items')}
      labels={tableLabels(translate)}
      loading={loading}
      onPage={onPageChange}
      page={data?.meta.page ?? 1}
      pages={data?.meta.totalPages ?? 1}
      pageSize={data?.meta.limit ?? pageSize}
      rows={data?.data ?? []}
      total={data?.meta.total ?? 0}
    />
  );
}

function InvoiceAction({
  label,
  onClick,
  children,
  destructive = false,
  disabled = false,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
  destructive?: boolean;
  disabled?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          aria-label={label}
          className={destructive ? 'border-0 focus-visible:border-0' : undefined}
          disabled={disabled}
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
