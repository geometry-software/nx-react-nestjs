import { ProductDeleteDialogs } from '../components/product-delete-dialogs';
import { ProductFormDialog } from '../components/product-form-dialog';
import { ProductInvoiceDialog } from '../components/product-invoice-dialog';
import { ProductsFilters } from '../components/products-filters';
import { ProductsHeader } from '../components/products-header';
import { ProductsTable } from '../components/products-table';
import { useProductsPage } from './products.page.ts';

export function Products() {
  const model = useProductsPage();
  return (
    <section className="space-y-6">
      <ProductsHeader
        onAdd={model.openCreateDialog}
        onCreateInvoice={model.openInvoiceDialog}
        onDeleteSelected={model.openBulkDeleteDialog}
        selectedCount={model.selectedCount}
        translate={model.translate}
      />
      <ProductsFilters
        onChange={model.changeFilter}
        onOrderChange={model.changeOrder}
        onSearchChange={model.changeSearch}
        query={model.query}
        search={model.search}
        translate={model.translate}
      />
      <ProductsTable
        data={model.data}
        language={model.language}
        loading={model.isFetching}
        onChange={model.changeFilter}
        onDelete={model.openDeleteDialog}
        onEdit={model.openEditDialog}
        onSelectedIdsChange={model.changeSelection}
        query={model.query}
        selectedIds={model.selectedIds}
        translate={model.translate}
      />
      <ProductFormDialog
        busy={model.saveBusy}
        editTarget={model.editTarget}
        error={model.error}
        invalidFields={model.invalidFields}
        onClose={model.closeProductDialog}
        onSubmit={model.submitProduct}
        open={model.dialogOpen}
        translate={model.translate}
      />
      <ProductDeleteDialogs
        bulkDeleteError={model.bulkDeleteError}
        bulkDeleteOpen={model.bulkDeleteOpen}
        deleteError={model.deleteError}
        deleteTarget={model.deleteTarget}
        isBulkDeleting={model.isBulkDeleting}
        isDeleting={model.isDeleting}
        onBulkDelete={model.deleteSelectedProducts}
        onCloseBulkDelete={model.closeBulkDeleteDialog}
        onCloseDelete={model.closeDeleteDialog}
        onDelete={model.deleteProduct}
        selectedCount={model.selectedCount}
        translate={model.translate}
      />
      <ProductInvoiceDialog
        busy={model.invoiceBusy}
        error={model.invoiceError}
        invoiceDescription={model.invoiceDescription}
        invoiceName={model.invoiceName}
        language={model.language}
        onClose={model.closeInvoiceDialog}
        onCreate={model.createInvoice}
        onDescriptionChange={model.changeInvoiceDescription}
        onNameChange={model.changeInvoiceName}
        onQuantityChange={model.changeInvoiceQuantity}
        open={model.reportOpen}
        products={model.reportProducts}
        quantities={model.reportQuantities}
        total={model.reportTotal}
        translate={model.translate}
        validationShown={model.invoiceValidationShown}
      />
    </section>
  );
}
