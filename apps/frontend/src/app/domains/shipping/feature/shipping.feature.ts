import { useState } from 'react';
import { useI18n } from '@/app/locales/i18n';
import { useListQueryParams } from '@/app/hooks/use-list-query-params';
import { createShippingValidation } from '../validation/shipping.validation';
import type { Shipment, ShipmentInput } from '../models/shipping.model';
import { useDebouncedSearchParam } from '@/app/hooks/use-debounced-search-param';
import { useRowSelection } from '@/app/hooks/use-row-selection';
import { useQueryErrorNotification } from '@/app/hooks/use-query-error-notification';
import { useNotification } from 'geometry-sdk/components';
import { useDebouncedValue } from '@/app/hooks/use-debounced-value';
import { useShippingService } from '../service/shipping.service';
import { executeRequest } from '@/app/utils/execute-request';

export function useShippingFeature() {
  const { language, translate } = useI18n();
  const { notifySuccess } = useNotification();
  const { params, setParams, query, isReady, change } = useListQueryParams();
  const requestQuery = query.toString();
  const {
    selectedIds,
    setSelectedIds,
    clearSelection,
    removeSelectedId,
  } = useRowSelection(requestQuery);
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
  const debouncedCitySearch = useDebouncedValue(citySearch, 250);
  const {
    listQuery: { data, isFetching, isError, refetch },
    invoicesQuery: { data: invoices, isFetching: invoicesLoading },
    usersQuery: { data: users, isFetching: usersLoading },
    countriesQuery: { data: countries, isFetching: countriesLoading },
    citiesQuery: { data: cities, isFetching: citiesLoading },
    create,
    remove,
    removeMany,
    refreshTracking,
    isCreating,
    isDeleting,
    isBulkDeleting,
    isRefreshing,
  } = useShippingService({
    citySearch: debouncedCitySearch,
    country: selectedCountryCode,
    enabled: isReady,
    query: requestQuery,
  });
  const [createOpen, setCreateOpen] = useState(false);
  const [detailsTarget, setDetailsTarget] = useState<Shipment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Shipment | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [error, setError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [bulkDeleteError, setBulkDeleteError] = useState('');
  const [invalidFields, setInvalidFields] = useState<Set<string>>(new Set());
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [search, setSearch] = useDebouncedSearchParam(params, setParams);

  useQueryErrorNotification({
    isError,
    message: translate('shipping.loadError'),
    retryLabel: translate('common.retry'),
    retry: refetch,
  });
  const activeUsers = users
    ? { ...users, data: users.data.filter((user) => user.active) }
    : undefined;
  const detailsDescription = detailsTarget
    ? `${detailsTarget.recipient.name} · ${detailsTarget.recipient.address}, ${detailsTarget.recipient.city}, ${detailsTarget.recipient.country}`
    : '';
  const clearValidationError = (path: string) => {
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

  const toggleInvoice = (invoiceId: string, selected: boolean) => {
    setSelectedInvoices((current) => {
      const next = new Set(current);
      if (selected) next.add(invoiceId);
      else next.delete(invoiceId);
      return next;
    });
    clearValidationError('invoiceIds');
  };

  const selectUser = (userId: string) => {
    setSelectedUserId(userId);
    clearValidationError('createdByUserId');
  };

  const openDetailsDialog = (shipment: Shipment) => setDetailsTarget(shipment);
  const closeDetailsDialog = () => {
    setDetailsTarget(null);
    setError('');
  };
  const openDeleteDialog = (shipment: Shipment) => {
    setDeleteError('');
    setDeleteTarget(shipment);
  };
  const closeDeleteDialog = () => {
    setDeleteTarget(null);
    setDeleteError('');
  };
  const openBulkDeleteDialog = () => {
    setBulkDeleteError('');
    setBulkDeleteOpen(true);
  };
  const closeBulkDeleteDialog = () => {
    setBulkDeleteOpen(false);
    setBulkDeleteError('');
  };

  const closeCreate = () => {
    setCreateOpen(false);
    setSelectedInvoices(new Set());
    setRecipient({ name: '', address: '', city: '', country: '' });
    setSelectedUserId('');
    setSelectedCountryCode('');
    setCitySearch('');
    setInvalidFields(new Set());
    setFieldErrors({});
    setError('');
  };

  const openCreate = () => {
    setError('');
    setInvalidFields(new Set());
    setFieldErrors({});
    setRecipient({ name: '', address: '', city: '', country: '' });
    setSelectedUserId('');
    setSelectedCountryCode('');
    setCitySearch('');
    setSelectedInvoices(new Set());
    setCreateOpen(true);
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

  const searchCity = (value: string) => {
    setCitySearch(value);
    updateRecipient('city', value);
  };

  const selectCity = (value: string) => {
    setCitySearch(value);
    updateRecipient('city', value);
  };

  const searchCountry = (value: string) => {
    updateRecipient('country', value);
    const selected = countries?.find(
      ({ code }) => code === selectedCountryCode,
    );
    if (value !== selected?.name) {
      setSelectedCountryCode('');
      setCitySearch('');
      updateRecipient('city', '');
    }
  };

  const selectCountry = (value: string, label: string) => {
    setSelectedCountryCode(value);
    updateRecipient('country', label);
    setCitySearch('');
    updateRecipient('city', '');
  };

  async function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const candidate = {
      createdByUserId: selectedUserId,
      recipient,
      invoiceIds: [...selectedInvoices],
    };
    const parsed = createShippingValidation(translate).safeParse(candidate);
    if (!parsed.success) {
      setError(translate('common.validation'));
      setInvalidFields(
        new Set(parsed.error.issues.map(({ path }) => path.join('.'))),
      );
      setFieldErrors(
        Object.fromEntries(
          parsed.error.issues.map(({ path, message }) => [
            path.join('.'),
            message,
          ]),
        ),
      );
      return;
    }
    setInvalidFields(new Set());
    const result = await executeRequest(() =>
      create({
          body: parsed.data as ShipmentInput,
          cacheKey: requestQuery,
        }),
    );
    if (!result.ok) {
      setError(
        apiErrorMessage(result.error) ?? translate('shipping.rejected'),
      );
      return;
    }
    notifySuccess(translate('shipping.createdNotice'));
    closeCreate();
  }

  async function deleteShipment() {
    if (!deleteTarget) return;
    const result = await executeRequest(
      () => remove({ id: deleteTarget.id, cacheKey: requestQuery }),
    );
    if (!result.ok) {
      setDeleteError(translate('shipping.rejected'));
      return;
    }
    notifySuccess(
      translate('shipping.removed', {
        name: deleteTarget.trackingNumber,
      }),
    );
    removeSelectedId(deleteTarget.id);
    setDeleteTarget(null);
    setDeleteError('');
  }

  async function deleteSelectedShipments() {
    const ids = [...selectedIds];
    if (!ids.length) return;
    const result = await executeRequest(
      () => removeMany({ ids, cacheKey: requestQuery }),
    );
    if (!result.ok) {
      setBulkDeleteError(translate('shipping.rejected'));
      return;
    }
    notifySuccess(
      translate('common.deletedSelected', { count: result.data.deleted }),
    );
    clearSelection();
    setBulkDeleteOpen(false);
    setBulkDeleteError('');
  }

  async function syncTracking() {
    if (!detailsTarget) return;
    const result = await executeRequest(() =>
      refreshTracking({
          id: detailsTarget.id,
          cacheKey: requestQuery,
        }),
    );
    if (!result.ok) {
      setError(
        apiErrorMessage(result.error) ??
          translate('shipping.trackingRejected'),
      );
      return;
    }
    setDetailsTarget(result.data);
    notifySuccess(translate('shipping.trackingUpdated'));
  }

  return {
    language,
    translate,
    query,
    data,
    isFetching,
    isError,
    refetch,
    invoices,
    invoicesLoading,
    users: activeUsers,
    usersLoading,
    countries,
    countriesLoading,
    cities,
    citiesLoading,
    isCreating,
    isDeleting,
    isBulkDeleting,
    isRefreshing,
    selectedIds,
    setSelectedIds,
    selectedInvoices,
    setSelectedInvoices,
    recipient,
    selectedUserId,
    setSelectedUserId,
    selectedCountryCode,
    setSelectedCountryCode,
    citySearch,
    setCitySearch,
    createOpen,
    setCreateOpen,
    detailsTarget,
    detailsDescription,
    setDetailsTarget,
    deleteTarget,
    setDeleteTarget,
    bulkDeleteOpen,
    setBulkDeleteOpen,
    error,
    setError,
    deleteError,
    setDeleteError,
    bulkDeleteError,
    setBulkDeleteError,
    invalidFields,
    setInvalidFields,
    fieldErrors,
    setFieldErrors,
    search,
    setSearch,
    change,
    toggleInvoice,
    selectUser,
    searchCity,
    selectCity,
    openDetailsDialog,
    closeDetailsDialog,
    openDeleteDialog,
    closeDeleteDialog,
    openBulkDeleteDialog,
    closeBulkDeleteDialog,
    closeCreate,
    openCreate,
    updateRecipient,
    searchCountry,
    selectCountry,
    submit,
    deleteShipment,
    deleteSelectedShipments,
    syncTracking,
  };
}

function apiErrorMessage(error: unknown): string | undefined {
  if (!error || typeof error !== 'object' || !('data' in error)) {
    return undefined;
  }
  const data = (error as { data?: unknown }).data;
  if (!data || typeof data !== 'object' || !('message' in data)) {
    return undefined;
  }
  const message = (data as { message?: unknown }).message;
  if (typeof message === 'string') return message;
  if (
    Array.isArray(message) &&
    message.every((item) => typeof item === 'string')
  ) {
    return message.join('. ');
  }
  return undefined;
}
