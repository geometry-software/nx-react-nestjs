import {
  useDebouncedSearchParam,
  useListQueryParams,
  useNotification,
  useQueryErrorNotification,
  useRowSelection,
} from 'geometry-sdk/components';
import { useState } from 'react';
import { useI18n } from '@/app/utils/i18n';
import { useProductInvoiceService } from '../service/product-invoice.service';
import { downloadProductInvoice } from '@/app/utils/invoice-report';
import { createProductValidation } from '../validation/products.validation';
import type { Product } from '../models/products.model';
import { executeRequest } from '@/app/utils/execute-request';
import {
  buildProductInvoiceInput,
  calculateProductInvoiceTotal,
} from '@/app/utils/product-invoice';

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
    selectProducts,
    createInvoice,
    isCreating,
    isUpdating,
    isDeleting,
    isBulkDeleting,
    isCreatingInvoice,
  } = useProductInvoiceService(requestQuery, isReady);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [invalidFields, setInvalidFields] = useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const {
    selectedIds,
    setSelectedIds,
    clearSelection,
    removeSelectedId,
  } = useRowSelection(requestQuery);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportProducts, setReportProducts] = useState<Product[]>([]);
  const [reportQuantities, setReportQuantities] = useState<
    Record<string, string>
  >({});
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [invoiceName, setInvoiceName] = useState('');
  const [invoiceDescription, setInvoiceDescription] = useState('');
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
    setDeleteTarget(product);
  };

  const closeDeleteDialog = () => {
    setDeleteTarget(null);
  };

  const openBulkDeleteDialog = () => {
    setBulkDeleteOpen(true);
  };

  const closeBulkDeleteDialog = () => {
    setBulkDeleteOpen(false);
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
    setInvalidFields(new Set());
    setFieldErrors({});
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
      notifyError(translate('common.validation'));
      setFieldErrors(Object.fromEntries(parsed.error.issues.map(({ path, message }) => [path.join('.'), message])));
      setInvalidFields(
        new Set(parsed.error.issues.map((issue) => String(issue.path[0]))),
      );
      return;
    }
    setInvalidFields(new Set());
    setFieldErrors({});
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
      notifyError(translate('products.rejected'));
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
      notifyError(translate('products.rejected'));
      return;
    }
    notifySuccess(
      translate('products.removed', { name: deleteTarget.name }),
    );
    removeSelectedId(deleteTarget.id);
    setDeleteTarget(null);
  }

  async function deleteSelectedProducts() {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    const result = await executeRequest(
      () => removeMany({ ids, cacheKey: requestQuery }),
    );
    if (!result.ok) {
      notifyError(translate('products.rejected'));
      return;
    }
    notifySuccess(
      translate('common.deletedSelected', { count: result.data.deleted }),
    );
    clearSelection();
    setBulkDeleteOpen(false);
  }

  function openProductReport() {
    const products = selectProducts(selectedIds);
    setReportProducts(products);
    setReportQuantities(
      Object.fromEntries(products.map(({ id }) => [id, '1'])),
    );
    setInvoiceName('');
    setInvoiceDescription('');
    setInvoiceValidationShown(false);
    setReportOpen(true);
  }

  const reportTotal = calculateProductInvoiceTotal(
    reportProducts,
    reportQuantities,
  );
  const invoiceInput = buildProductInvoiceInput(
    invoiceName,
    invoiceDescription,
    reportProducts,
    reportQuantities,
  );

  async function createSelectedInvoice() {
    setInvoiceValidationShown(true);
    if (!invoiceInput) {
      notifyError(translate('common.validation'));
      return;
    }
    setIsGeneratingReport(true);
    const invoiceResult = await executeRequest(() =>
      createInvoice(invoiceInput),
    );
    if (!invoiceResult.ok) {
      notifyError(translate('products.invoiceRejected'));
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
    invalidFields,
    fieldErrors,
    dialogOpen,
    setDialogOpen,
    editTarget,
    setEditTarget,
    deleteTarget,
    setDeleteTarget,
    selectedIds,
    setSelectedIds,
    bulkDeleteOpen,
    setBulkDeleteOpen,
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
    selectedCount: selectedIds.size,
    saveBusy: isCreating || isUpdating,
    invoiceBusy: isCreatingInvoice || isGeneratingReport,
    changeSelection: setSelectedIds,
    closeProductDialog: closeDialog,
    submitProduct: submit,
    openInvoiceDialog: openProductReport,
    closeInvoiceDialog: closeReportDialog,
    createInvoice: createSelectedInvoice,
    changeInvoiceDescription: setInvoiceDescription,
    changeInvoiceName: setInvoiceName,
    changeInvoiceQuantity: updateReportQuantity,
    changeFilter: change,
    changeSearch: setSearch,
  };
}
