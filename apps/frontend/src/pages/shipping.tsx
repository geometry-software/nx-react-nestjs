import {
  CheckCircle2,
  Package,
  RefreshCw,
  Route,
  Search,
  Trash2,
  Truck,
} from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ButtonLoader } from '@nx-react-nestjs/components/app/button-loader';
import { Autocomplete } from '@nx-react-nestjs/components/app/autocomplete';
import { ConfirmDialog } from '@nx-react-nestjs/components/app/confirm-dialog';
import { DataTable } from '@nx-react-nestjs/components/app/data-table';
import { EntityDialog } from '@nx-react-nestjs/components/app/entity-dialog';
import { FilterSelect } from '@nx-react-nestjs/components/app/filter-select';
import { OperationNotice } from '@nx-react-nestjs/components/app/operation-notice';
import { Alert, AlertDescription } from '@nx-react-nestjs/components/ui/alert';
import { Badge } from '@nx-react-nestjs/components/ui/badge';
import { Button } from '@nx-react-nestjs/components/ui/button';
import { Card, CardContent } from '@nx-react-nestjs/components/ui/card';
import { Checkbox } from '@nx-react-nestjs/components/ui/checkbox';
import { Input } from '@nx-react-nestjs/components/ui/input';
import { Label } from '@nx-react-nestjs/components/ui/label';
import {
  RadioGroup,
  RadioGroupItem,
} from '@nx-react-nestjs/components/ui/radio-group';
import { formatDateTime } from '@/lib/format-date';
import { shipmentSchema } from '@/lib/schemas';
import type { Invoice, Shipment, ShipmentInput, ShipmentStatus, User } from '@/lib/types';
import { useDebouncedSearchParam } from '@/lib/use-debounced-search-param';
import { confirmDialogLabels, tableLabels, useI18n } from '../app/i18n';
import {
  invoicesUrl,
  shippingUrl,
  usersUrl,
  useCreateShipmentMutation,
  useDeleteShipmentMutation,
  useDeleteShipmentsMutation,
  useListInvoicesQuery,
  useListCitiesQuery,
  useListCountriesQuery,
  useListShipmentsQuery,
  useListUsersQuery,
  useRefreshShipmentTrackingMutation,
} from '@/services/api';

const statusValues: ShipmentStatus[] = [
  'created',
  'in_transit',
  'out_for_delivery',
  'delivered',
  'exception',
  'cancelled',
];

export function Shipping() {
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
  const requestUrl = `${shippingUrl}/api/shippings?${query}`;
  const invoicePickerUrl = `${invoicesUrl}/api/invoices?page=1&limit=100&sort=name&order=asc&status=complete`;
  const userPickerUrl = `${usersUrl}/api/users?page=1&limit=100&sort=name&order=asc`;
  const countriesUrl = `${shippingUrl}/api/locations/countries`;
  const { data, isFetching, isError, refetch } = useListShipmentsQuery(
    requestUrl,
    { refetchOnMountOrArgChange: true },
  );
  const { data: invoices, isFetching: invoicesLoading } =
    useListInvoicesQuery(invoicePickerUrl);
  const { data: users, isFetching: usersLoading } =
    useListUsersQuery(userPickerUrl);
  const { data: countries, isFetching: countriesLoading } =
    useListCountriesQuery(countriesUrl);
  const [create, { isLoading: isCreating }] = useCreateShipmentMutation();
  const [remove, { isLoading: isDeleting }] = useDeleteShipmentMutation();
  const [removeMany, { isLoading: isBulkDeleting }] =
    useDeleteShipmentsMutation();
  const [refreshTracking, { isLoading: isRefreshing }] =
    useRefreshShipmentTrackingMutation();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedInvoices, setSelectedInvoices] = useState<Set<string>>(
    new Set(),
  );
  const [recipient, setRecipient] = useState<ShipmentInput['recipient']>({
    name: '',
    address: '',
    city: '',
    country: '',
  });
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedCountryCode, setSelectedCountryCode] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [debouncedCitySearch, setDebouncedCitySearch] = useState('');
  const cityUrl = selectedCountryCode
    ? `${shippingUrl}/api/locations/cities?country=${encodeURIComponent(
        selectedCountryCode,
      )}&search=${encodeURIComponent(debouncedCitySearch)}`
    : '';
  const { data: cities, isFetching: citiesLoading } = useListCitiesQuery(
    cityUrl,
    { skip: !selectedCountryCode },
  );
  const [createOpen, setCreateOpen] = useState(false);
  const [detailsTarget, setDetailsTarget] = useState<Shipment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Shipment | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [error, setError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [bulkDeleteError, setBulkDeleteError] = useState('');
  const [invalidFields, setInvalidFields] = useState<Set<string>>(new Set());
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useDebouncedSearchParam(params, setParams);

  useEffect(() => setSelectedIds(new Set()), [requestUrl]);
  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedCitySearch(citySearch),
      250,
    );
    return () => window.clearTimeout(timer);
  }, [citySearch]);

  const change = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    value ? next.set(key, value) : next.delete(key);
    if (key !== 'page') next.set('page', '1');
    setParams(next);
  };

  const closeCreate = () => {
    setCreateOpen(false);
    setSelectedInvoices(new Set());
    setRecipient({ name: '', address: '', city: '', country: '' });
    setSelectedUserId('');
    setSelectedCountryCode('');
    setCitySearch('');
    setDebouncedCitySearch('');
    setInvalidFields(new Set());
    setFieldErrors({});
    setError('');
  };

  const updateRecipient = (
    field: keyof ShipmentInput['recipient'],
    value: string,
  ) => {
    setRecipient((current) => ({ ...current, [field]: value }));
    const path = `recipient.${field}`;
    setInvalidFields((current) => {
      if (!current.has(path)) return current;
      const next = new Set(current);
      next.delete(path);
      return next;
    });
    setFieldErrors((current) => {
      if (!(path in current)) return current;
      const next = { ...current };
      delete next[path];
      return next;
    });
    setError('');
  };

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const candidate = {
      createdByUserId: selectedUserId,
      recipient,
      invoiceIds: [...selectedInvoices],
    };
    const parsed = shipmentSchema.safeParse(candidate);
    if (!parsed.success) {
      setError(t('common.validation'));
      setInvalidFields(
        new Set(parsed.error.issues.map(({ path }) => path.join('.'))),
      );
      setFieldErrors(
        Object.fromEntries(
          parsed.error.issues.map(({ path, message }) => [path.join('.'), message]),
        ),
      );
      return;
    }
    setInvalidFields(new Set());
    try {
      await create({
        body: parsed.data as ShipmentInput,
        cacheKey: requestUrl,
      }).unwrap();
      setNotice(t('shipping.createdNotice'));
      closeCreate();
    } catch (requestError) {
      setError(apiErrorMessage(requestError) ?? t('shipping.rejected'));
    }
  }

  async function deleteShipment() {
    if (!deleteTarget) return;
    try {
      await remove({ id: deleteTarget.id, cacheKey: requestUrl }).unwrap();
      setNotice(t('shipping.removed', { name: deleteTarget.trackingNumber }));
      setSelectedIds((current) => {
        const next = new Set(current);
        next.delete(deleteTarget.id);
        return next;
      });
      setDeleteTarget(null);
      setDeleteError('');
    } catch {
      setDeleteError(t('shipping.rejected'));
    }
  }

  async function deleteSelectedShipments() {
    const ids = [...selectedIds];
    if (!ids.length) return;
    try {
      const result = await removeMany({ ids, cacheKey: requestUrl }).unwrap();
      setNotice(t('common.deletedSelected', { count: result.deleted }));
      setSelectedIds(new Set());
      setBulkDeleteOpen(false);
      setBulkDeleteError('');
    } catch {
      setBulkDeleteError(t('shipping.rejected'));
    }
  }

  async function syncTracking() {
    if (!detailsTarget) return;
    try {
      const shipment = await refreshTracking({
        id: detailsTarget.id,
        cacheKey: requestUrl,
      }).unwrap();
      setDetailsTarget(shipment);
      setNotice(t('shipping.trackingUpdated'));
    } catch (requestError) {
      setError(
        apiErrorMessage(requestError) ?? t('shipping.trackingRejected'),
      );
    }
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">{t('shipping.title')}</h1>
          <p className="mt-2 text-muted-foreground">{t('shipping.subtitle')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            disabled={!selectedIds.size}
            onClick={() => setBulkDeleteOpen(true)}
            size="lg"
            variant="destructive"
          >
            <Trash2 />
            {t('common.deleteSelected', { count: selectedIds.size })}
          </Button>
          <Button
            onClick={() => {
              setError('');
              setInvalidFields(new Set());
              setFieldErrors({});
              setRecipient({ name: '', address: '', city: '', country: '' });
              setSelectedUserId('');
              setSelectedCountryCode('');
              setCitySearch('');
              setDebouncedCitySearch('');
              setSelectedInvoices(new Set());
              setCreateOpen(true);
            }}
            size="lg"
          >
            <Truck />
            {t('shipping.add')}
          </Button>
        </div>
      </header>
      {isError && (
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between">
            {t('shipping.loadError')}
            <Button onClick={() => refetch()} size="sm" variant="outline">
              {t('common.retry')}
            </Button>
          </AlertDescription>
        </Alert>
      )}
      <Card>
        <CardContent className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <Field label={t('shipping.searchLabel')}>
            <div className="relative">
              <Search className="pointer-events-none absolute inset-y-0 left-3 my-auto size-4 text-muted-foreground" />
              <Input
                className="w-full pl-9 lg:w-80"
                placeholder={t('shipping.searchPlaceholder')}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </Field>
          <div className="flex flex-wrap items-end gap-3">
            <Field label={t('shipping.status')}>
              <FilterSelect
                ariaLabel={t('shipping.status')}
                value={query.get('status') ?? ''}
                onChange={(value) => change('status', value)}
                options={[
                  { value: '', label: t('shipping.allStatuses') },
                  ...statusValues.map((status) => ({
                    value: status,
                    label: t(`shipping.status.${status}`),
                  })),
                ]}
              />
            </Field>
            <Field label={t('common.sort')}>
              <FilterSelect
                ariaLabel={t('shipping.sortLabel')}
                value={query.get('sort') ?? 'createdAt'}
                onChange={(value) => change('sort', value)}
                options={[
                  { value: 'createdAt', label: t('shipping.createdDate') },
                  { value: 'updatedAt', label: t('shipping.updatedDate') },
                  { value: 'trackingNumber', label: t('shipping.trackingNumber') },
                  { value: 'status', label: t('shipping.status') },
                ]}
              />
            </Field>
            <Field label={t('common.rows')}>
              <FilterSelect
                ariaLabel={t('shipping.pageSize')}
                value={query.get('limit') ?? '10'}
                onChange={(value) => change('limit', value)}
                options={['5', '10', '20'].map((value) => ({ value, label: value }))}
              />
            </Field>
          </div>
        </CardContent>
      </Card>
      <DataTable<Shipment>
        columns={[
          {
            label: t('shipping.trackingNumber'),
            render: (shipment) => (
              <span className="font-semibold">
                {shipment.trackingNumber}
              </span>
            ),
          },
          {
            label: t('shipping.recipient'),
            render: (shipment) => (
              <span className="grid">
                <strong>{shipment.recipient.name}</strong>
                <small className="text-muted-foreground">
                  {shipment.recipient.city}, {shipment.recipient.country}
                </small>
              </span>
            ),
          },
          {
            label: t('shipping.invoices'),
            render: (shipment) =>
              t('shipping.invoiceCount', {
                count: shipment.invoices?.length ?? 0,
              }),
          },
          {
            label: t('shipping.createdBy'),
            render: (shipment) => shipment.createdBy?.name ?? '—',
          },
          {
            label: t('shipping.status'),
            render: (shipment) => (
              <Badge variant={shipment.status === 'delivered' ? 'default' : 'secondary'}>
                {t(`shipping.status.${shipment.status}`)}
              </Badge>
            ),
          },
          {
            label: t('shipping.updatedDate'),
            className: 'whitespace-nowrap',
            render: (shipment) => formatDateTime(shipment.updatedAt, language),
          },
          {
            label: '',
            className: 'w-24',
            render: (shipment) => (
              <div className="flex items-center justify-end gap-1">
                <Button
                  aria-label={t('shipping.viewTracking', {
                    name: shipment.trackingNumber,
                  })}
                  className="text-primary"
                  onClick={() => setDetailsTarget(shipment)}
                  size="icon"
                  title={t('shipping.viewTracking', {
                    name: shipment.trackingNumber,
                  })}
                  variant="ghost"
                >
                  <Route />
                </Button>
                <Button
                  aria-label={t('common.delete', { name: shipment.trackingNumber })}
                  className="border-0 focus-visible:border-0"
                  onClick={() => setDeleteTarget(shipment)}
                  size="icon"
                  variant="destructive"
                >
                  <Trash2 />
                </Button>
              </div>
            ),
          },
        ]}
        itemLabel={t('shipping.items')}
        labels={tableLabels(t)}
        loading={isFetching}
        onPage={(page) => change('page', String(page))}
        onSelectedIdsChange={setSelectedIds}
        page={data?.meta.page ?? 1}
        pages={data?.meta.totalPages ?? 1}
        pageSize={data?.meta.limit ?? Number(query.get('limit') ?? 10)}
        rows={data?.data ?? []}
        selectedIds={selectedIds}
        total={data?.meta.total ?? 0}
      />
      <EntityDialog
        description={t('shipping.modalDescription')}
        onClose={closeCreate}
        open={createOpen}
        title={t('shipping.modalTitle')}
      >
        <form className="grid gap-4" onSubmit={submit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              error={fieldErrors['recipient.name']}
              label={t('shipping.recipientName')}
              invalid={invalidFields.has('recipient.name')}
            >
              <Input
                aria-invalid={invalidFields.has('recipient.name')}
                name="recipientName"
                onChange={(event) => updateRecipient('name', event.target.value)}
                value={recipient.name}
              />
            </FormField>
            <FormField
              error={fieldErrors['recipient.address']}
              label={t('shipping.address')}
              invalid={invalidFields.has('recipient.address')}
            >
              <Input
                aria-invalid={invalidFields.has('recipient.address')}
                name="address"
                onChange={(event) => updateRecipient('address', event.target.value)}
                value={recipient.address}
              />
            </FormField>
            <FormField
              error={fieldErrors['recipient.country']}
              label={t('shipping.country')}
              invalid={invalidFields.has('recipient.country')}
            >
              <Autocomplete
                ariaLabel={t('shipping.country')}
                emptyText={t('shipping.noCountries')}
                invalid={invalidFields.has('recipient.country')}
                loading={countriesLoading}
                onSearchChange={(value) => {
                  updateRecipient('country', value);
                  const selected = countries?.find(
                    ({ code }) => code === selectedCountryCode,
                  );
                  if (value !== selected?.name) {
                    setSelectedCountryCode('');
                    setCitySearch('');
                    setDebouncedCitySearch('');
                    updateRecipient('city', '');
                  }
                }}
                onSelect={(option) => {
                  setSelectedCountryCode(option.value);
                  updateRecipient('country', option.label);
                  setCitySearch('');
                  setDebouncedCitySearch('');
                  updateRecipient('city', '');
                }}
                options={(countries ?? []).map((country) => ({
                  value: country.code,
                  label: country.name,
                }))}
                placeholder={t('shipping.countryPlaceholder')}
                value={recipient.country}
              />
            </FormField>
            <FormField
              error={fieldErrors['recipient.city']}
              label={t('shipping.city')}
              invalid={invalidFields.has('recipient.city')}
            >
              <Autocomplete
                ariaLabel={t('shipping.city')}
                disabled={!selectedCountryCode}
                emptyText={t('shipping.noCities')}
                invalid={invalidFields.has('recipient.city')}
                loading={citiesLoading}
                onSearchChange={(value) => {
                  setCitySearch(value);
                  updateRecipient('city', value);
                }}
                onSelect={(option) => {
                  setCitySearch(option.label);
                  updateRecipient('city', option.label);
                }}
                options={(cities ?? []).map((city) => ({
                  value: city.name,
                  label: city.name,
                }))}
                placeholder={
                  selectedCountryCode
                    ? t('shipping.cityPlaceholder')
                    : t('shipping.selectCountryFirst')
                }
                value={recipient.city}
              />
            </FormField>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t('shipping.selectInvoices')}>
              <div
                className={`h-56 space-y-2 overflow-auto rounded-lg border p-3 ${
                  invalidFields.has('invoiceIds') ? 'border-destructive' : ''
                }`}
              >
                {invoicesLoading ? (
                  <p className="text-sm text-muted-foreground">{t('app.loading')}</p>
                ) : (
                  (invoices?.data ?? []).map((invoice) => (
                    <InvoiceChoice
                      key={invoice.id}
                      invoice={invoice}
                      selected={selectedInvoices.has(invoice.id)}
                      onChange={(selected) => {
                        const next = new Set(selectedInvoices);
                        selected
                          ? next.add(invoice.id)
                          : next.delete(invoice.id);
                        setSelectedInvoices(next);
                        clearValidationError(
                          'invoiceIds',
                          setInvalidFields,
                          setFieldErrors,
                        );
                        setError('');
                      }}
                    />
                  ))
                )}
              </div>
              {!invoicesLoading && !invoices?.data.length && (
                <p className="text-sm text-muted-foreground">
                  {t('shipping.noInvoices')}
                </p>
              )}
              {fieldErrors.invoiceIds && (
                <p className="text-sm text-destructive">
                  {fieldErrors.invoiceIds}
                </p>
              )}
            </Field>
            <Field label={t('shipping.selectUser')}>
              <RadioGroup
                className={`h-56 space-y-2 overflow-auto rounded-lg border p-3 ${
                  invalidFields.has('createdByUserId') ? 'border-destructive' : ''
                }`}
                onValueChange={(userId) => {
                  setSelectedUserId(userId);
                  clearValidationError(
                    'createdByUserId',
                    setInvalidFields,
                    setFieldErrors,
                  );
                  setError('');
                }}
                value={selectedUserId}
              >
                {usersLoading ? (
                  <p className="text-sm text-muted-foreground">{t('app.loading')}</p>
                ) : (
                  (users?.data ?? [])
                    .filter((user) => user.active)
                    .map((user) => (
                      <UserChoice
                        key={user.id}
                        user={user}
                      />
                    ))
                )}
              </RadioGroup>
              {fieldErrors.createdByUserId && (
                <p className="text-sm text-destructive">
                  {fieldErrors.createdByUserId}
                </p>
              )}
            </Field>
          </div>
          {error && (
            <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>
          )}
          <Button disabled={isCreating} size="lg" type="submit">
            {isCreating ? <ButtonLoader /> : <CheckCircle2 />}
            {isCreating ? t('common.saving') : t('shipping.create')}
          </Button>
        </form>
      </EntityDialog>
      <EntityDialog
        description={detailsTarget ? formatAddress(detailsTarget) : undefined}
        onClose={() => { setDetailsTarget(null); setError(''); }}
        open={Boolean(detailsTarget)}
        title={detailsTarget?.trackingNumber ?? ''}
      >
        {detailsTarget && (
          <div className="grid gap-5">
            {detailsTarget.createdBy && (
              <section>
                <h3 className="mb-2 font-semibold">{t('shipping.createdBy')}</h3>
                <div className="rounded-lg border p-3">
                  <strong className="block">{detailsTarget.createdBy.name}</strong>
                  <small className="text-muted-foreground">
                    {detailsTarget.createdBy.email} · {detailsTarget.createdBy.role}
                  </small>
                </div>
              </section>
            )}
            <section>
              <h3 className="mb-2 font-semibold">{t('shipping.invoices')}</h3>
              <div className="space-y-2">
                {(detailsTarget.invoices ?? []).map((invoice) => (
                  <div
                    className="flex items-center justify-between gap-3 rounded-lg border p-3"
                    key={invoice.invoiceId}
                  >
                    <strong>{invoice.name}</strong>
                    <Badge variant="secondary">
                      {invoice.total.toLocaleString(undefined, {
                        style: 'currency',
                        currency: 'USD',
                      })}
                    </Badge>
                  </div>
                ))}
              </div>
            </section>
            <section>
              <h3 className="mb-2 font-semibold">{t('shipping.products')}</h3>
              <div className="space-y-2">
                {detailsTarget.items.map((item) => (
                  <div className="flex items-center gap-3 rounded-lg border p-3" key={item.productId}>
                    <Package className="text-primary" />
                    <span className="flex-1">{item.name}</span>
                    <Badge variant="secondary">× {item.quantity}</Badge>
                  </div>
                ))}
              </div>
            </section>
            <section>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="font-semibold">{t('shipping.tracker')}</h3>
                <Button disabled={isRefreshing} onClick={syncTracking} size="sm" variant="outline">
                  {isRefreshing ? <ButtonLoader /> : <RefreshCw />}
                  {t('shipping.refresh')}
                </Button>
              </div>
              <div className="space-y-3 border-l-2 border-primary/20 pl-4">
                {detailsTarget.trackingEvents.map((event) => (
                  <div className="relative" key={`${event.occurredAt}-${event.status}`}>
                    <span className="absolute -left-[21px] top-1 size-2.5 rounded-full bg-primary" />
                    <strong className="block text-sm">{event.status}</strong>
                    <small className="text-muted-foreground">
                      {event.location ? `${event.location} · ` : ''}
                      {formatDateTime(event.occurredAt, language)}
                    </small>
                  </div>
                ))}
              </div>
            </section>
            {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
          </div>
        )}
      </EntityDialog>
      <ConfirmDialog
        busy={isDeleting}
        error={deleteError}
        itemName={deleteTarget?.trackingNumber ?? ''}
        labels={confirmDialogLabels(t)}
        onClose={() => { setDeleteTarget(null); setDeleteError(''); }}
        onConfirm={deleteShipment}
        open={Boolean(deleteTarget)}
      />
      <ConfirmDialog
        busy={isBulkDeleting}
        error={bulkDeleteError}
        itemName={t('common.selectedItems', { count: selectedIds.size })}
        labels={confirmDialogLabels(t)}
        onClose={() => { setBulkDeleteOpen(false); setBulkDeleteError(''); }}
        onConfirm={deleteSelectedShipments}
        open={bulkDeleteOpen}
      />
      {notice && (
        <OperationNotice closeLabel={t('common.close')} message={notice} onClose={() => setNotice('')} />
      )}
    </section>
  );
}

function InvoiceChoice({
  invoice,
  selected,
  onChange,
}: {
  invoice: Invoice;
  selected: boolean;
  onChange: (selected: boolean) => void;
}) {
  return (
    <Label className="flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-muted/50">
      <Checkbox
        checked={selected}
        onCheckedChange={(checked) => onChange(checked === true)}
      />
      <span className="min-w-0 flex-1">
        <strong className="block truncate text-sm">{invoice.name}</strong>
        <small className="text-muted-foreground">
          {invoice.items.length} ·{' '}
          {invoice.total.toLocaleString(undefined, {
            style: 'currency',
            currency: 'USD',
          })}
        </small>
      </span>
    </Label>
  );
}

function UserChoice({
  user,
}: {
  user: User;
}) {
  const id = `shipping-user-${user.id}`;
  return (
    <Label
      className="flex cursor-pointer items-center gap-3 rounded-md p-1 hover:bg-muted/50"
      htmlFor={id}
    >
      <RadioGroupItem id={id} value={user.id} />
      <span className="min-w-0">
        <strong className="block truncate text-sm">{user.name}</strong>
        <small className="block truncate text-muted-foreground">{user.email}</small>
      </span>
    </Label>
  );
}

function clearValidationError(
  path: string,
  setInvalidFields: React.Dispatch<React.SetStateAction<Set<string>>>,
  setFieldErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>,
) {
  setInvalidFields((current) => {
    if (!current.has(path)) return current;
    const next = new Set(current);
    next.delete(path);
    return next;
  });
  setFieldErrors((current) => {
    if (!(path in current)) return current;
    const next = { ...current };
    delete next[path];
    return next;
  });
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div className="grid gap-2"><Label>{label}</Label>{children}</div>;
}

function FormField({
  label,
  invalid,
  error,
  children,
}: {
  label: string;
  invalid?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label className={invalid ? 'text-destructive' : undefined}>{label}</Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

function formatAddress(shipment: Shipment) {
  const { recipient } = shipment;
  return `${recipient.name} · ${recipient.address}, ${recipient.city}, ${recipient.country}`;
}

function apiErrorMessage(error: unknown): string | undefined {
  if (!error || typeof error !== 'object' || !('data' in error)) return undefined;
  const data = (error as { data?: unknown }).data;
  if (!data || typeof data !== 'object' || !('message' in data)) return undefined;
  const message = (data as { message?: unknown }).message;
  if (typeof message === 'string') return message;
  if (Array.isArray(message) && message.every((item) => typeof item === 'string')) {
    return message.join('. ');
  }
  return undefined;
}
