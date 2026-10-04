import { useState } from 'react';
import { useI18n } from '@/app/locales/i18n';
import { useListQueryParams } from '@/app/hooks/use-list-query-params';
import { useProductsService } from '../service/products.service';
import { downloadProductInvoice } from '@/app/utils/reports/invoice-report';
import { createProductValidation } from '../validation/products.validation';
import type { Product } from '../models/products.model';
import { useDebouncedSearchParam } from '@/app/hooks/use-debounced-search-param';
import { useRowSelection } from '@/app/hooks/use-row-selection';
import { useQueryErrorNotification } from '@/app/hooks/use-query-error-notification';
import { useNotification } from 'geometry-sdk/components';
import { executeRequest } from '@/app/utils/execute-request';

export function useProductsFeature() {
  const { language, translate } = useI18n();
  const { notifyError, notifySuccess } = useNotification();
  const { params, setParams, query, isReady, change, changeOrder } =
    useListQueryParams();
  const requestQuery = query.toString();
  const {
    listQuery: { data, isFetching, isError, refetch },
    create,
    update,
    remove,
    removeMany,
    createInvoice,
    isCreating,
    isUpdating,
    isDeleting,
    isBulkDeleting,
    isCreatingInvoice,
  } = useProductsService(requestQuery, isReady);
  const [error, setError] = useState('');
  const [invalidFields, setInvalidFields] = useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const {
    selectedIds,
    setSelectedIds,
    clearSelection,
    removeSelectedId,
  } = useRowSelection(requestQuery);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleteError, setBulkDeleteError] = useState('');
  const [reportOpen, setReportOpen] = useState(false);
  const [reportProducts, setReportProducts] = useState<Product[]>([]);
  const [reportQuantities, setReportQuantities] = useState<
    Record<string, string>
  >({});
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [invoiceName, setInvoiceName] = useState('');
  const [invoiceDescription, setInvoiceDescription] = useState('');
  const [invoiceError, setInvoiceError] = useState('');
  const [invoiceValidationShown, setInvoiceValidationShown] = useState(false);
  const [search, setSearch] = useDebouncedSearchParam(params, setParams);

  useQueryErrorNotification({
    isError,
    message: translate('products.loadError'),
    retryLabel: translate('common.retry'),
    retry: refetch,
  });

  const openCreateDialog = () => {
    setEditTarget(null);
    setDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditTarget(product);
    setDialogOpen(true);
  };

  const openDeleteDialog = (product: Product) => {
    setDeleteError('');
    setDeleteTarget(product);
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

  const closeReportDialog = () => setReportOpen(false);

  const updateReportQuantity = (productId: string, quantity: string) => {
    setReportQuantities((current) => ({
      ...current,
      [productId]: quantity,
    }));
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setError('');
    setInvalidFields(new Set());
  };

  async function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const parsed = createProductValidation(translate).safeParse({
      name: form.get('name'),
      price: form.get('price'),
      quantity: form.get('quantity'),
      description: form.get('description'),
      active: true,
    });
    if (!parsed.success) {
      setError(translate('common.validation'));
      setInvalidFields(
        new Set(parsed.error.issues.map((issue) => String(issue.path[0]))),
      );
      return;
    }
    setInvalidFields(new Set());
    const saved = await executeRequest(() =>
      editTarget
        ? update({
            id: editTarget.id,
            body: parsed.data,
            cacheKey: requestQuery,
          })
        : create({ body: parsed.data, cacheKey: requestQuery }),
    );
    if (!saved.ok) {
      setError(translate('products.rejected'));
      return;
    }
    formElement.reset();
    notifySuccess(translate(editTarget ? 'products.saved' : 'products.created'));
    closeDialog();
  }

  async function deleteProduct() {
    if (!deleteTarget) return;
    const result = await executeRequest(
      () => remove({ id: deleteTarget.id, cacheKey: requestQuery }),
    );
    if (!result.ok) {
      setDeleteError(translate('products.rejected'));
      return;
    }
    notifySuccess(
      translate('products.removed', { name: deleteTarget.name }),
    );
    removeSelectedId(deleteTarget.id);
    setDeleteTarget(null);
    setDeleteError('');
  }

  async function deleteSelectedProducts() {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    const result = await executeRequest(
      () => removeMany({ ids, cacheKey: requestQuery }),
    );
    if (!result.ok) {
      setBulkDeleteError(translate('products.rejected'));
      return;
    }
    notifySuccess(
      translate('common.deletedSelected', { count: result.data.deleted }),
    );
    clearSelection();
    setBulkDeleteOpen(false);
    setBulkDeleteError('');
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
  const reportIsValid =
    reportProducts.every((product) => {
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
    const invoiceResult = await executeRequest(() =>
      createInvoice({
          name: invoiceName.trim(),
          description: invoiceDescription.trim() || undefined,
          items: reportProducts.map((product) => ({
            productId: product.id,
            quantity: Number(reportQuantities[product.id]),
          })),
        }),
    );
    if (!invoiceResult.ok) {
      setInvoiceError(translate('products.invoiceRejected'));
      setIsGeneratingReport(false);
      return;
    }
    const invoice = invoiceResult.data;

    setReportOpen(false);
    clearSelection();
    notifySuccess(translate('products.invoiceCreated', { name: invoice.name }));
    const downloadResult = await executeRequest(() =>
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
    if (!downloadResult.ok) {
      notifyError(translate('products.invoiceRejected'));
    }
    setIsGeneratingReport(false);
  }

  return {
    language,
    translate,
    query,
    data,
    isFetching,
    isError,
    refetch,
    isCreating,
    isUpdating,
    isDeleting,
    isBulkDeleting,
    isCreatingInvoice,
    error,
    invalidFields,
    dialogOpen,
    setDialogOpen,
    editTarget,
    setEditTarget,
    deleteTarget,
    setDeleteTarget,
    deleteError,
    setDeleteError,
    selectedIds,
    setSelectedIds,
    bulkDeleteOpen,
    setBulkDeleteOpen,
    bulkDeleteError,
    setBulkDeleteError,
    reportOpen,
    setReportOpen,
    reportProducts,
    reportQuantities,
    setReportQuantities,
    isGeneratingReport,
    invoiceName,
    setInvoiceName,
    invoiceDescription,
    setInvoiceDescription,
    invoiceError,
    invoiceValidationShown,
    search,
    setSearch,
    change,
    changeOrder,
    closeDialog,
    openCreateDialog,
    openEditDialog,
    openDeleteDialog,
    closeDeleteDialog,
    openBulkDeleteDialog,
    closeBulkDeleteDialog,
    closeReportDialog,
    updateReportQuantity,
    submit,
    deleteProduct,
    deleteSelectedProducts,
    openProductReport,
    reportTotal,
    createSelectedInvoice,
  };
}
