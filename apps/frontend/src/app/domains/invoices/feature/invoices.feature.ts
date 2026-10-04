import { useState } from 'react';
import { useI18n } from '@/app/locales/i18n';
import { useListQueryParams } from '@/app/hooks/use-list-query-params';
import { downloadProductInvoice } from '@/app/utils/reports/invoice-report';
import type { Invoice } from '../models/invoices.model';
import { createInvoiceUpdateValidation } from '../validation/invoices.validation';
import { useDebouncedSearchParam } from '@/app/hooks/use-debounced-search-param';
import { useQueryErrorNotification } from '@/app/hooks/use-query-error-notification';
import { useInvoicesService } from '../service/invoices.service';
import { useNotification } from 'geometry-sdk/components';
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
  const [actionError, setActionError] = useState('');

  useQueryErrorNotification({
    isError,
    message: translate('invoices.loadError'),
    retryLabel: translate('common.retry'),
    retry: refetch,
  });

  const openEditDialog = (invoice: Invoice) => {
    setError('');
    setEditTarget(invoice);
  };

  const closeEditDialog = () => {
    setEditTarget(null);
    setError('');
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
      setError(translate('invoices.nameError'));
      return;
    }
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
  };
}
