import {
  useDebouncedSearchParam,
  useListQueryParams,
  useNotification,
  useQueryErrorNotification,
} from 'geometry-sdk/components';
import { useState } from 'react';
import { useI18n } from '@/app/utils/i18n';
import { downloadProductInvoice } from '@/app/utils/invoice-report';
import type { Invoice } from '../models/invoices.model';
import { createInvoiceUpdateValidation } from '../validation/invoices.validation';
import { useInvoicesService } from '../service/invoices.service';
import { executeRequest } from '@/app/utils/execute-request';

export function useInvoicesFeature() {
  const { language, translate } = useI18n();
  const { notifyError, notifySuccess } = useNotification();
  const { params, setParams, query, isReady, change, changeOrder } =
    useListQueryParams();
  const requestQuery = query.toString();
  const {
    listQuery: { data, isFetching, isError, refetch },
    update,
    confirm,
    cancel,
    isUpdating,
    isConfirming,
    isCancelling,
  } = useInvoicesService(requestQuery, isReady);
  const [search, setSearch] = useDebouncedSearchParam(params, setParams);
  const [editTarget, setEditTarget] = useState<Invoice | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<Invoice | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Invoice | null>(null);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [actionError, setActionError] = useState('');

  useQueryErrorNotification({
    isError,
    message: translate('invoices.loadError'),
    retryLabel: translate('common.retry'),
    retry: refetch,
  });

  const openEditDialog = (invoice: Invoice) => {
    setError('');
    setFieldErrors({});
    setEditTarget(invoice);
  };

  const closeEditDialog = () => {
    setEditTarget(null);
    setError('');
    setFieldErrors({});
  };

  const openConfirmDialog = (invoice: Invoice) => {
    setActionError('');
    setConfirmTarget(invoice);
  };

  const closeConfirmDialog = () => {
    setConfirmTarget(null);
    setActionError('');
  };

  const openCancelDialog = (invoice: Invoice) => {
    setActionError('');
    setCancelTarget(invoice);
  };

  const closeCancelDialog = () => {
    setCancelTarget(null);
    setActionError('');
  };

  async function save(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editTarget) return;
    const form = new FormData(event.currentTarget);
    const parsed = createInvoiceUpdateValidation(translate).safeParse({
      name: form.get('name'),
      description: form.get('description') ?? '',
    });
    if (!parsed.success) {
      setFieldErrors(Object.fromEntries(parsed.error.issues.map(({ path, message }) => [path.join('.'), message])));
      setError('');
      notifyError(translate('common.validation'));
      return;
    }
    setFieldErrors({});
    const result = await executeRequest(() =>
      update({
          id: editTarget.id,
          cacheKey: requestQuery,
          body: parsed.data,
        }),
    );
    if (!result.ok) {
      setError(translate('invoices.rejected'));
      return;
    }
    setEditTarget(null);
    setError('');
    notifySuccess(translate('invoices.saved'));
  }

  async function confirmPendingInvoice() {
    if (!confirmTarget) return;
    const result = await executeRequest(
      () => confirm({ id: confirmTarget.id, cacheKey: requestQuery }),
    );
    if (!result.ok) {
      setActionError(translate('invoices.confirmRejected'));
      return;
    }
    notifySuccess(
      translate('invoices.confirmed', { name: confirmTarget.name }),
    );
    setConfirmTarget(null);
    setActionError('');
  }

  async function cancelPendingInvoice() {
    if (!cancelTarget) return;
    const result = await executeRequest(
      () => cancel({ id: cancelTarget.id, cacheKey: requestQuery }),
    );
    if (!result.ok) {
      setActionError(translate('invoices.rejected'));
      return;
    }
    notifySuccess(
      translate('invoices.cancelled', { name: cancelTarget.name }),
    );
    setCancelTarget(null);
    setActionError('');
  }

  async function printInvoice(invoice: Invoice) {
    const result = await executeRequest(() =>
      downloadProductInvoice(invoice, language, {
        title: translate('products.reportTitle'),
        description: translate('products.reportDescription'),
        generated: translate('products.reportGenerated'),
        product: translate('products.name'),
        productDescription: translate('products.description'),
        inventoryId: translate('products.inventoryId'),
        price: translate('products.priceUsd'),
        quantity: translate('products.reportQuantity'),
        lineTotal: translate('products.reportLineTotal'),
        total: translate('products.reportTotal'),
      }),
    );
    if (!result.ok) notifyError(translate('invoices.rejected'));
  }

  return {
    language,
    translate,
    query,
    data,
    isFetching,
    isError,
    refetch,
    isUpdating,
    isConfirming,
    isCancelling,
    search,
    setSearch,
    editTarget,
    setEditTarget,
    confirmTarget,
    setConfirmTarget,
    cancelTarget,
    setCancelTarget,
    error,
    fieldErrors,
    setError,
    actionError,
    setActionError,
    change,
    changeOrder,
    openEditDialog,
    closeEditDialog,
    openConfirmDialog,
    closeConfirmDialog,
    openCancelDialog,
    closeCancelDialog,
    save,
    confirmPendingInvoice,
    cancelPendingInvoice,
    printInvoice,
    pageSize: Number(query.get('limit') ?? 10),
    changePage: (page: number) => change('page', String(page)),
    submitEdit: save,
    confirmInvoice: confirmPendingInvoice,
    cancelInvoice: cancelPendingInvoice,
    confirmOpen: confirmTarget !== null,
    confirmTargetName: confirmTarget?.name ?? '',
    cancelOpen: cancelTarget !== null,
    cancelTargetName: cancelTarget?.name ?? '',
    changeFilter: change,
    changeSearch: setSearch,
  };
}
