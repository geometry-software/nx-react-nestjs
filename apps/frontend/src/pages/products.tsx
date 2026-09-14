import {
  CheckCircle2,
  FileDown,
  Package,
  Pencil,
  PlusCircle,
  Search,
  Trash2,
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
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@nx-react-nestjs/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@nx-react-nestjs/components/ui/tooltip';
import { formatDateTime } from '@/lib/format-date';
import { downloadProductInvoice } from '@/lib/product-report';
import { confirmDialogLabels, tableLabels, useI18n } from '../app/i18n';
import { productSchema } from '@/lib/schemas';
import type { Invoice, Product } from '@/lib/types';
import { useDebouncedSearchParam } from '@/lib/use-debounced-search-param';
import {
  productsUrl,
  useCreateInvoiceMutation,
  useCreateProductMutation,
  useDeleteProductMutation,
  useDeleteProductsMutation,
  useListProductsQuery,
  useUpdateProductMutation,
} from '@/services/api';

export function Products() {
  const { language, t } = useI18n();
  const [params, setParams] = useSearchParams();
  const query = new URLSearchParams(params);
  for (const [key, value] of Object.entries({
    page: '1',
    limit: '10',
    sort: 'createdAt',
    order: 'desc',
  }))
    if (!query.has(key)) query.set(key, value);
  const requestUrl = `${productsUrl}/api/products?${query}`;
  const { data, isFetching, isError, refetch } = useListProductsQuery(
    requestUrl,
    { refetchOnMountOrArgChange: true },
  );
  const [create, { isLoading: isCreating }] = useCreateProductMutation();
  const [update, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [remove, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [removeMany, { isLoading: isBulkDeleting }] =
    useDeleteProductsMutation();
  const [createInvoice, { isLoading: isCreatingInvoice }] =
    useCreateInvoiceMutation();
  const [error, setError] = useState('');
  const [invalidFields, setInvalidFields] = useState<Set<string>>(new Set());
  const [notice, setNotice] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleteError, setBulkDeleteError] = useState('');
  const [reportOpen, setReportOpen] = useState(false);
  const [reportProducts, setReportProducts] = useState<Product[]>([]);
  const [reportQuantities, setReportQuantities] = useState<Record<string, string>>({});
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [invoiceName, setInvoiceName] = useState('');
  const [invoiceDescription, setInvoiceDescription] = useState('');
  const [invoiceError, setInvoiceError] = useState('');
  const [invoiceValidationShown, setInvoiceValidationShown] = useState(false);
  const [search, setSearch] = useDebouncedSearchParam(params, setParams);
  useEffect(() => setSelectedIds(new Set()), [requestUrl]);
  const change = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    value ? next.set(key, value) : next.delete(key);
    if (key !== 'page') next.set('page', '1');
    setParams(next);
  };
  const closeDialog = () => {
    setDialogOpen(false);
    setError('');
    setInvalidFields(new Set());
  };

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const parsed = productSchema.safeParse({
      name: form.get('name'),
      price: form.get('price'),
      quantity: form.get('quantity'),
      description: form.get('description'),
      active: true,
    });
    if (!parsed.success) {
      setError(t('common.validation'));
      setInvalidFields(
        new Set(parsed.error.issues.map((issue) => String(issue.path[0]))),
      );
      return;
    }
    setInvalidFields(new Set());
    try {
      if (editTarget)
        await update({ id: editTarget.id, body: parsed.data, cacheKey: requestUrl }).unwrap();
      else await create({ body: parsed.data, cacheKey: requestUrl }).unwrap();
    } catch {
      setError(t('products.rejected'));
      return;
    }
    formElement.reset();
    setNotice(t(editTarget ? 'products.saved' : 'products.created'));
    closeDialog();
  }
  async function deleteProduct() {
    if (!deleteTarget) return;
    try {
      await remove({ id: deleteTarget.id, cacheKey: requestUrl }).unwrap();
      setNotice(t('products.removed', { name: deleteTarget.name }));
      setSelectedIds((current) => {
        const next = new Set(current);
        next.delete(deleteTarget.id);
        return next;
      });
      setDeleteTarget(null);
      setDeleteError('');
    } catch {
      setDeleteError(t('products.rejected'));
    }
  }

  async function deleteSelectedProducts() {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    try {
      const result = await removeMany({ ids, cacheKey: requestUrl }).unwrap();
      setNotice(t('common.deletedSelected', { count: result.deleted }));
      setSelectedIds(new Set());
      setBulkDeleteOpen(false);
      setBulkDeleteError('');
    } catch {
      setBulkDeleteError(t('products.rejected'));
    }
  }

  function openProductReport() {
    const products = (data?.data ?? []).filter(({ id }) => selectedIds.has(id));
    setReportProducts(products);
    setReportQuantities(
      Object.fromEntries(products.map(({ id }) => [id, '1'])),
    );
    setInvoiceName('');
    setInvoiceDescription('');
    setInvoiceError('');
    setInvoiceValidationShown(false);
    setReportOpen(true);
  }

  const reportTotal = reportProducts.reduce(
    (sum, product) =>
      sum + product.price * (Number(reportQuantities[product.id]) || 0),
    0,
  );
  const reportIsValid = reportProducts.every((product) => {
    const quantity = Number(reportQuantities[product.id]);
    return (
      Number.isInteger(quantity) &&
      quantity > 0 &&
      quantity <= (product.quantity ?? 0)
    );
  }) && invoiceName.trim().length >= 2;

  async function createSelectedInvoice() {
    setInvoiceValidationShown(true);
    if (!reportIsValid) return;
    setIsGeneratingReport(true);
    setInvoiceError('');
    let invoice: Invoice;
    try {
      invoice = await createInvoice({
        name: invoiceName.trim(),
        description: invoiceDescription.trim() || undefined,
        items: reportProducts.map((product) => ({
          productId: product.id,
          quantity: Number(reportQuantities[product.id]),
        })),
      }).unwrap();
    } catch {
      setInvoiceError(t('products.invoiceRejected'));
      setIsGeneratingReport(false);
      return;
    }

    setReportOpen(false);
    setSelectedIds(new Set());
    setNotice(t('products.invoiceCreated', { name: invoice.name }));
    try {
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
    } catch {
      // The invoice is already persisted even if the browser blocks the download.
    } finally {
      setIsGeneratingReport(false);
    }
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            {t('products.title')}
          </h1>
          <p className="mt-2 text-muted-foreground">{t('products.subtitle')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            disabled={selectedIds.size === 0}
            onClick={() => {
              setBulkDeleteError('');
              setBulkDeleteOpen(true);
            }}
            size="lg"
            variant="destructive"
          >
            <Trash2 />
            {t('common.deleteSelected', { count: selectedIds.size })}
          </Button>
          <Button
            disabled={selectedIds.size === 0}
            onClick={openProductReport}
            size="lg"
            variant="outline"
          >
            <FileDown />
            {t('common.reportSelected', { count: selectedIds.size })}
          </Button>
          <Button
            onClick={() => {
              setEditTarget(null);
              setDialogOpen(true);
            }}
            size="lg"
          >
            <PlusCircle />
            {t('products.add')}
          </Button>
        </div>
      </header>
      {isError && (
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between">
            {t('products.loadError')}
            <Button onClick={() => refetch()} size="sm" variant="outline">
              {t('common.retry')}
            </Button>
          </AlertDescription>
        </Alert>
      )}
      <Card>
        <CardContent className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid gap-2">
            <Label htmlFor="product-search">{t('products.searchLabel')}</Label>
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 left-3 my-auto size-4 text-muted-foreground"
              />
              <Input
                className="w-full pl-9 lg:w-80"
                id="product-search"
                placeholder={t('products.searchPlaceholder')}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <Field label={t('common.sort')}>
              <FilterSelect
                ariaLabel={t('products.sortLabel')}
                value={query.get('sort') ?? 'createdAt'}
                onChange={(value) => change('sort', value)}
                options={[
                  { value: 'id', label: t('products.inventoryId') },
                  { value: 'createdAt', label: t('products.createdDate') },
                  { value: 'updatedAt', label: t('products.updatedDate') },
                  { value: 'name', label: t('products.name') },
                  { value: 'price', label: t('products.price') },
                  { value: 'quantity', label: t('products.quantity') },
                ]}
              />
            </Field>
            <div
              className="flex gap-1 rounded-lg border p-1"
              aria-label={t('products.direction')}
            >
              <Button
                onClick={() =>
                  query.get('order') === 'desc'
                    ? refetch()
                    : change('order', 'desc')
                }
                size="sm"
                variant={query.get('order') === 'desc' ? 'default' : 'ghost'}
              >
                {t('common.desc')}
              </Button>
              <Button
                onClick={() =>
                  query.get('order') === 'asc'
                    ? refetch()
                    : change('order', 'asc')
                }
                size="sm"
                variant={query.get('order') === 'asc' ? 'default' : 'ghost'}
              >
                {t('common.asc')}
              </Button>
            </div>
            <Field label={t('common.rows')}>
              <FilterSelect
                ariaLabel={t('products.pageSize')}
                className="min-w-20"
                value={query.get('limit') ?? '10'}
                onChange={(value) => change('limit', value)}
                options={['5', '10', '20'].map((value) => ({
                  value,
                  label: value,
                }))}
              />
            </Field>
          </div>
        </CardContent>
      </Card>
      <DataTable<Product>
        labels={tableLabels(t)}
        selectedIds={selectedIds}
        onSelectedIdsChange={setSelectedIds}
        rows={data?.data ?? []}
        loading={isFetching}
        total={data?.meta.total ?? 0}
        page={data?.meta.page ?? 1}
        pageSize={data?.meta.limit ?? Number(query.get('limit') ?? 10)}
        pages={data?.meta.totalPages ?? 1}
        itemLabel={t('products.items')}
        onPage={(page) => change('page', String(page))}
        columns={[
          {
            label: t('products.details'),
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
            label: t('products.inventoryId'),
            className: 'w-36',
            render: (product) => (
              <Badge variant="secondary">
                NX-{product.id.slice(-6).toUpperCase()}
              </Badge>
            ),
          },
          {
            label: t('products.priceUsd'),
            className: 'w-36 font-semibold',
            render: (product) =>
              product.price.toLocaleString(
                language === 'es'
                  ? 'es-ES'
                  : language === 'pt'
                    ? 'pt-BR'
                    : 'en-US',
                { style: 'currency', currency: 'USD' },
              ),
          },
          {
            label: t('products.quantity'),
            className: 'w-28 font-semibold',
            render: (product) => product.quantity ?? 0,
          },
          {
            label: t('products.createdDate'),
            className: 'w-44 whitespace-nowrap',
            render: (product) => formatDateTime(product.createdAt, language),
          },
          {
            label: t('products.updatedDate'),
            className: 'w-44 whitespace-nowrap',
            render: (product) => formatDateTime(product.updatedAt, language),
          },
          {
            label: '',
            className: 'w-24',
            render: (product) => (
              <div className="flex justify-end gap-1">
                <ActionButton
                  label={t('common.edit', { name: product.name })}
                  onClick={() => {
                    setEditTarget(product);
                    setDialogOpen(true);
                  }}
                >
                  <Pencil />
                </ActionButton>
                <ActionButton
                  destructive
                  label={t('common.delete', { name: product.name })}
                  onClick={() => {
                    setDeleteError('');
                    setDeleteTarget(product);
                  }}
                >
                  <Trash2 />
                </ActionButton>
              </div>
            ),
          },
        ]}
      />
      <EntityDialog
        open={dialogOpen}
        onClose={closeDialog}
        title={t(editTarget ? 'products.editTitle' : 'products.modalTitle')}
        description={t('products.modalDescription')}
      >
        <form
          className="grid gap-4"
          key={editTarget?.id ?? 'create-product'}
          onSubmit={submit}
        >
          <FormField
            label={t('products.productName')}
            required={t('common.required')}
          >
            <Input
              aria-invalid={invalidFields.has('name')}
              defaultValue={editTarget?.name}
              name="name"
              placeholder={t('products.namePlaceholder')}
            />
          </FormField>
          <FormField label={t('products.priceUsd')}>
            <Input
              aria-invalid={invalidFields.has('price')}
              defaultValue={editTarget?.price}
              min="0"
              name="price"
              placeholder="$ 1299.00"
              step="0.01"
              type="number"
            />
          </FormField>
          <FormField label={t('products.quantity')}>
            <Input
              aria-invalid={invalidFields.has('quantity')}
              defaultValue={editTarget?.quantity ?? 0}
              min="0"
              name="quantity"
              step="1"
              type="number"
            />
          </FormField>
          <FormField label={t('products.description')}>
            <Textarea
              aria-invalid={invalidFields.has('description')}
              defaultValue={editTarget?.description}
              name="description"
              placeholder={t('products.descriptionPlaceholder')}
            />
          </FormField>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button disabled={isCreating || isUpdating} size="lg" type="submit">
            {isCreating || isUpdating ? <ButtonLoader /> : <CheckCircle2 />}
            {isCreating || isUpdating
              ? t(editTarget ? 'common.saving' : 'products.publishing')
              : t(editTarget ? 'common.saveChanges' : 'products.publish')}
          </Button>
        </form>
      </EntityDialog>
      <ConfirmDialog
        labels={confirmDialogLabels(t)}
        busy={isDeleting}
        error={deleteError}
        itemName={deleteTarget?.name ?? ''}
        onClose={() => {
          setDeleteTarget(null);
          setDeleteError('');
        }}
        onConfirm={deleteProduct}
        open={Boolean(deleteTarget)}
      />
      <ConfirmDialog
        labels={confirmDialogLabels(t)}
        busy={isBulkDeleting}
        error={bulkDeleteError}
        itemName={t('common.selectedItems', { count: selectedIds.size })}
        onClose={() => {
          setBulkDeleteOpen(false);
          setBulkDeleteError('');
        }}
        onConfirm={deleteSelectedProducts}
        open={bulkDeleteOpen}
      />
      <EntityDialog
        className="sm:max-w-3xl"
        description={t('products.reportModalDescription')}
        onClose={() => setReportOpen(false)}
        open={reportOpen}
        title={t('products.reportModalTitle')}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label={t('products.invoiceName')}
            required={t('common.required')}
          >
            <Input
              aria-invalid={invoiceValidationShown && invoiceName.trim().length < 2}
              onChange={(event) => setInvoiceName(event.target.value)}
              placeholder={t('products.invoiceNamePlaceholder')}
              value={invoiceName}
            />
            {invoiceValidationShown && invoiceName.trim().length < 2 && (
              <p className="text-sm text-destructive">
                {t('products.invoiceNameError')}
              </p>
            )}
          </FormField>
          <FormField label={t('products.invoiceDescription')}>
            <Input
              onChange={(event) => setInvoiceDescription(event.target.value)}
              placeholder={t('products.invoiceDescriptionPlaceholder')}
              value={invoiceDescription}
            />
          </FormField>
        </div>
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('products.name')}</TableHead>
                <TableHead className="w-36">{t('products.priceUsd')}</TableHead>
                <TableHead className="w-32">{t('products.reportQuantity')}</TableHead>
                <TableHead className="w-40 text-right">{t('products.reportLineTotal')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportProducts.map((product) => {
                const quantity = Number(reportQuantities[product.id]) || 0;
                return (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{formatCurrency(product.price, language)}</TableCell>
                    <TableCell>
                      <Input
                        aria-label={`${t('products.reportQuantity')}: ${product.name}`}
                        aria-invalid={
                          quantity < 1 ||
                          !Number.isInteger(quantity) ||
                          quantity > (product.quantity ?? 0)
                        }
                        className="w-20"
                        min="1"
                        onChange={(event) =>
                          setReportQuantities((current) => ({
                            ...current,
                            [product.id]: event.target.value,
                          }))
                        }
                        step="1"
                        type="number"
                        value={reportQuantities[product.id] ?? '1'}
                      />
                      <small
                        className={
                          quantity > (product.quantity ?? 0)
                            ? 'text-destructive'
                            : 'text-muted-foreground'
                        }
                      >
                        {quantity > (product.quantity ?? 0)
                          ? t('products.invoiceQuantityError', {
                              count: product.quantity ?? 0,
                            })
                          : t('products.invoiceAvailable', {
                              count: product.quantity ?? 0,
                            })}
                      </small>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(product.price * quantity, language)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell className="text-right" colSpan={3}>
                  {t('products.reportTotal')}
                </TableCell>
                <TableCell className="text-right text-base font-bold">
                  {formatCurrency(reportTotal, language)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
        {invoiceError && (
          <Alert variant="destructive">
            <AlertDescription>{invoiceError}</AlertDescription>
          </Alert>
        )}
        <Button
          disabled={isCreatingInvoice || isGeneratingReport}
          onClick={createSelectedInvoice}
          size="lg"
        >
          {isCreatingInvoice || isGeneratingReport ? <ButtonLoader /> : <FileDown />}
          {t('products.reportConfirm')}
        </Button>
      </EntityDialog>
      {notice && (
        <OperationNotice
          closeLabel={t('common.close')}
          message={notice}
          onClose={() => setNotice('')}
        />
      )}
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function formatCurrency(value: number, language: 'en' | 'es' | 'pt') {
  return value.toLocaleString(
    language === 'es' ? 'es-ES' : language === 'pt' ? 'pt-BR' : 'en-US',
    { style: 'currency', currency: 'USD' },
  );
}
function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label className="flex items-center justify-between">
        {label}
        {required && <Badge variant="secondary">{required}</Badge>}
      </Label>
      {children}
    </div>
  );
}
function ActionButton({
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
          className={
            destructive ? 'border-0 focus-visible:border-0' : undefined
          }
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
