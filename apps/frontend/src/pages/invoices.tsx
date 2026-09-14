import {
  Ban,
  CheckCircle2,
  FileCheck2,
  Pencil,
  Printer,
  Search,
} from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ButtonLoader } from '@nx-react-nestjs/components/app/button-loader';
import { ConfirmDialog } from '@nx-react-nestjs/components/app/confirm-dialog';
import { DataTable } from '@nx-react-nestjs/components/app/data-table';
import { EntityDialog } from '@nx-react-nestjs/components/app/entity-dialog';
import { FilterSelect } from '@nx-react-nestjs/components/app/filter-select';
import { OperationNotice } from '@nx-react-nestjs/components/app/operation-notice';
import { Alert, AlertDescription } from '@nx-react-nestjs/components/ui/alert';
import { Badge } from '@nx-react-nestjs/components/ui/badge';
import { Button } from '@nx-react-nestjs/components/ui/button';
import { Card, CardContent } from '@nx-react-nestjs/components/ui/card';
import { Input } from '@nx-react-nestjs/components/ui/input';
import { Label } from '@nx-react-nestjs/components/ui/label';
import { Textarea } from '@nx-react-nestjs/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@nx-react-nestjs/components/ui/tooltip';
import { useI18n, tableLabels } from '../app/i18n';
import { formatDateTime } from '@/lib/format-date';
import { downloadProductInvoice } from '@/lib/product-report';
import type { Invoice, InvoiceStatus } from '@/lib/types';
import { useDebouncedSearchParam } from '@/lib/use-debounced-search-param';
import {
  invoicesUrl,
  useCancelInvoiceMutation,
  useConfirmInvoiceMutation,
  useListInvoicesQuery,
  useUpdateInvoiceMutation,
} from '@/services/api';

export function Invoices() {
  const { language, t } = useI18n();
  const [params, setParams] = useSearchParams();
  const query = new URLSearchParams(params);
  for (const [key, value] of Object.entries({
    page: '1',
    limit: '10',
    sort: 'createdAt',
    order: 'desc',
  })) {
    if (!query.has(key)) query.set(key, value);
  }
  const requestUrl = `${invoicesUrl}/api/invoices?${query}`;
  const { data, isFetching, isError, refetch } = useListInvoicesQuery(
    requestUrl,
    { refetchOnMountOrArgChange: true },
  );
  const [update, { isLoading: isUpdating }] = useUpdateInvoiceMutation();
  const [confirm, { isLoading: isConfirming }] = useConfirmInvoiceMutation();
  const [cancel, { isLoading: isCancelling }] = useCancelInvoiceMutation();
  const [search, setSearch] = useDebouncedSearchParam(params, setParams);
  const [editTarget, setEditTarget] = useState<Invoice | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<Invoice | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Invoice | null>(null);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [notice, setNotice] = useState('');

  const change = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    value ? next.set(key, value) : next.delete(key);
    if (key !== 'page') next.set('page', '1');
    setParams(next);
  };

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editTarget) return;
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') ?? '').trim();
    if (name.length < 2) {
      setError(t('invoices.nameError'));
      return;
    }
    try {
      await update({
        id: editTarget.id,
        cacheKey: requestUrl,
        body: {
          name,
          description: String(form.get('description') ?? '').trim(),
        },
      }).unwrap();
      setEditTarget(null);
      setError('');
      setNotice(t('invoices.saved'));
    } catch {
      setError(t('invoices.rejected'));
    }
  }

  async function confirmPendingInvoice() {
    if (!confirmTarget) return;
    try {
      await confirm({ id: confirmTarget.id, cacheKey: requestUrl }).unwrap();
      setNotice(t('invoices.confirmed', { name: confirmTarget.name }));
      setConfirmTarget(null);
      setActionError('');
    } catch {
      setActionError(t('invoices.confirmRejected'));
    }
  }

  async function cancelPendingInvoice() {
    if (!cancelTarget) return;
    try {
      await cancel({ id: cancelTarget.id, cacheKey: requestUrl }).unwrap();
      setNotice(t('invoices.cancelled', { name: cancelTarget.name }));
      setCancelTarget(null);
      setActionError('');
    } catch {
      setActionError(t('invoices.rejected'));
    }
  }

  async function printInvoice(invoice: Invoice) {
    await downloadProductInvoice(invoice, language, {
      title: t('products.reportTitle'),
      description: t('products.reportDescription'),
      generated: t('products.reportGenerated'),
      product: t('products.name'),
      productDescription: t('products.description'),
      inventoryId: t('products.inventoryId'),
      price: t('products.priceUsd'),
      quantity: t('products.reportQuantity'),
      lineTotal: t('products.reportLineTotal'),
      total: t('products.reportTotal'),
    });
  }

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-4xl font-bold tracking-tight">{t('invoices.title')}</h1>
        <p className="mt-2 text-muted-foreground">{t('invoices.subtitle')}</p>
      </header>
      {isError && (
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between">
            {t('invoices.loadError')}
            <Button onClick={() => refetch()} size="sm" variant="outline">
              {t('common.retry')}
            </Button>
          </AlertDescription>
        </Alert>
      )}
      <Card>
        <CardContent className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <Field label={t('invoices.searchLabel')}>
            <div className="relative">
              <Search className="pointer-events-none absolute inset-y-0 left-3 my-auto size-4 text-muted-foreground" />
              <Input
                className="w-full pl-9 lg:w-80"
                placeholder={t('invoices.searchPlaceholder')}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </Field>
          <div className="flex flex-wrap items-end gap-3">
            <Field label={t('invoices.status')}>
              <FilterSelect
                ariaLabel={t('invoices.status')}
                value={query.get('status') ?? 'all'}
                onChange={(value) => change('status', value === 'all' ? '' : value)}
                options={[
                  { value: 'all', label: t('invoices.allStatuses') },
                  ...(['pending', 'complete', 'rejected'] as InvoiceStatus[]).map((status) => ({
                    value: status,
                    label: t(`invoices.status.${status}`),
                  })),
                ]}
              />
            </Field>
            <Field label={t('common.sort')}>
              <FilterSelect
                ariaLabel={t('invoices.sortLabel')}
                value={query.get('sort') ?? 'createdAt'}
                onChange={(value) => change('sort', value)}
                options={[
                  { value: 'createdAt', label: t('invoices.createdDate') },
                  { value: 'updatedAt', label: t('invoices.updatedDate') },
                  { value: 'name', label: t('invoices.name') },
                  { value: 'status', label: t('invoices.status') },
                  { value: 'total', label: t('invoices.total') },
                ]}
              />
            </Field>
            <div className="flex gap-1 rounded-lg border p-1">
              <Button onClick={() => change('order', 'desc')} size="sm" variant={query.get('order') === 'desc' ? 'default' : 'ghost'}>{t('common.desc')}</Button>
              <Button onClick={() => change('order', 'asc')} size="sm" variant={query.get('order') === 'asc' ? 'default' : 'ghost'}>{t('common.asc')}</Button>
            </div>
            <Field label={t('common.rows')}>
              <FilterSelect ariaLabel={t('invoices.pageSize')} className="min-w-20" value={query.get('limit') ?? '10'} onChange={(value) => change('limit', value)} options={['5', '10', '20'].map((value) => ({ value, label: value }))} />
            </Field>
          </div>
        </CardContent>
      </Card>
      <DataTable<Invoice>
        labels={tableLabels(t)}
        rows={data?.data ?? []}
        loading={isFetching}
        total={data?.meta.total ?? 0}
        page={data?.meta.page ?? 1}
        pageSize={data?.meta.limit ?? 10}
        pages={data?.meta.totalPages ?? 1}
        itemLabel={t('invoices.items')}
        onPage={(page) => change('page', String(page))}
        columns={[
          { label: t('invoices.details'), render: (invoice) => <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary"><FileCheck2 /></span><span className="grid"><strong>{invoice.name}</strong><small className="max-w-64 truncate text-muted-foreground">{invoice.description || t('invoices.noDescription')}</small></span></div> },
          { label: t('invoices.total'), className: 'w-32 font-semibold', render: (invoice) => formatCurrency(invoice.total, language) },
          { label: t('invoices.status'), className: 'w-28', render: (invoice) => <StatusBadge status={invoice.status}>{t(`invoices.status.${invoice.status}`)}</StatusBadge> },
          { label: t('invoices.createdDate'), className: 'w-40 whitespace-nowrap', render: (invoice) => formatDateTime(invoice.createdAt, language) },
          { label: t('invoices.updatedDate'), className: 'w-40 whitespace-nowrap', render: (invoice) => formatDateTime(invoice.updatedAt, language) },
          { label: t('invoices.actions'), className: 'w-44', render: (invoice) => <div className="flex justify-end gap-1"><ActionButton label={t('invoices.edit', { name: invoice.name })} disabled={invoice.status !== 'pending'} onClick={() => { setError(''); setEditTarget(invoice); }}><Pencil /></ActionButton><ActionButton label={t('invoices.print', { name: invoice.name })} onClick={() => printInvoice(invoice)}><Printer /></ActionButton><ActionButton label={t('invoices.confirm', { name: invoice.name })} disabled={invoice.status !== 'pending'} onClick={() => { setActionError(''); setConfirmTarget(invoice); }}><CheckCircle2 /></ActionButton><ActionButton destructive label={t('invoices.cancel', { name: invoice.name })} disabled={invoice.status !== 'pending'} onClick={() => { setActionError(''); setCancelTarget(invoice); }}><Ban /></ActionButton></div> },
        ]}
      />
      <EntityDialog open={Boolean(editTarget)} onClose={() => { setEditTarget(null); setError(''); }} title={t('invoices.editTitle')} description={t('invoices.editDescription')}>
        <form className="grid gap-4" key={editTarget?.id} onSubmit={save}>
          <Field label={t('invoices.name')}><Input aria-invalid={Boolean(error)} defaultValue={editTarget?.name} name="name" /></Field>
          <Field label={t('invoices.description')}><Textarea defaultValue={editTarget?.description} name="description" /></Field>
          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
          <Button disabled={isUpdating} size="lg" type="submit">{isUpdating ? <ButtonLoader /> : <CheckCircle2 />}{isUpdating ? t('common.saving') : t('common.saveChanges')}</Button>
        </form>
      </EntityDialog>
      <ConfirmDialog open={Boolean(confirmTarget)} itemName={confirmTarget?.name ?? ''} busy={isConfirming} error={actionError} onClose={() => { setConfirmTarget(null); setActionError(''); }} onConfirm={confirmPendingInvoice} tone="confirm" labels={{ title: t('invoices.confirmTitle'), description: t('invoices.confirmDescription'), warning: t('invoices.confirmWarning'), cancel: t('common.cancel'), deleting: t('invoices.confirming'), confirmDelete: t('invoices.confirmAction') }} />
      <ConfirmDialog open={Boolean(cancelTarget)} itemName={cancelTarget?.name ?? ''} busy={isCancelling} error={actionError} onClose={() => { setCancelTarget(null); setActionError(''); }} onConfirm={cancelPendingInvoice} labels={{ title: t('invoices.cancelTitle'), description: t('invoices.cancelDescription'), warning: t('invoices.cancelWarning'), cancel: t('common.cancel'), deleting: t('invoices.cancelling'), confirmDelete: t('invoices.cancelAction') }} />
      {notice && <OperationNotice closeLabel={t('common.close')} message={notice} onClose={() => setNotice('')} />}
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div className="grid gap-2"><Label>{label}</Label>{children}</div>;
}

function StatusBadge({ status, children }: { status: InvoiceStatus; children: ReactNode }) {
  const styles: Record<InvoiceStatus, string> = { pending: 'border-amber-200 bg-amber-50 text-amber-700', complete: 'border-emerald-200 bg-emerald-50 text-emerald-700', rejected: 'border-red-200 bg-red-50 text-red-700' };
  return <Badge className={styles[status]} variant="outline">{children}</Badge>;
}

function ActionButton({ label, onClick, children, destructive = false, disabled = false }: { label: string; onClick: () => void; children: ReactNode; destructive?: boolean; disabled?: boolean }) {
  return <Tooltip><TooltipTrigger asChild><Button aria-label={label} className={destructive ? 'border-0 focus-visible:border-0' : undefined} disabled={disabled} onClick={onClick} size="icon" variant={destructive ? 'destructive' : 'ghost'}>{children}</Button></TooltipTrigger><TooltipContent>{label}</TooltipContent></Tooltip>;
}

function formatCurrency(value: number, language: 'en' | 'es' | 'pt') {
  return value.toLocaleString(language === 'es' ? 'es-ES' : language === 'pt' ? 'pt-BR' : 'en-US', { style: 'currency', currency: 'USD' });
}
