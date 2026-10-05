import { ProductDeleteDialogs } from '../components/product-delete-dialogs';
import { ProductFormDialog } from '../components/product-form-dialog';
import { ProductInvoiceDialog } from '../components/product-invoice-dialog';
import { ProductsFilters } from '../components/products-filters';
import { ProductsHeader } from '../components/products-header';
import { ProductsTable } from '../components/products-table';
import { useProductsFeature } from '../feature/products.feature';

export function Products() {
  const feature = useProductsFeature();
  return (
    <section className="space-y-6">
      <ProductsHeader
        onAdd={feature.openCreateDialog}
        onCreateInvoice={feature.openInvoiceDialog}
        onDeleteSelected={feature.openBulkDeleteDialog}
        selectedCount={feature.selectedCount}
        translate={feature.translate}
      />
      <ProductsFilters
        onChange={feature.changeFilter}
        onOrderChange={feature.changeOrder}
        onSearchChange={feature.changeSearch}
        query={feature.query}
        search={feature.search}
        translate={feature.translate}
      />
      <ProductsTable
        data={feature.data}
        language={feature.language}
        loading={feature.isFetching}
        onChange={feature.changeFilter}
        onDelete={feature.openDeleteDialog}
        onEdit={feature.openEditDialog}
        onSelectedIdsChange={feature.changeSelection}
        query={feature.query}
        selectedIds={feature.selectedIds}
        translate={feature.translate}
      />
      <ProductFormDialog
        busy={feature.saveBusy}
        editTarget={feature.editTarget}
        error={feature.error}
        invalidFields={feature.invalidFields}
        fieldErrors={feature.fieldErrors}
        onClose={feature.closeProductDialog}
        onSubmit={feature.submitProduct}
        open={feature.dialogOpen}
        translate={feature.translate}
      />
      <ProductDeleteDialogs
        bulkDeleteError={feature.bulkDeleteError}
        bulkDeleteOpen={feature.bulkDeleteOpen}
        deleteError={feature.deleteError}
        deleteTarget={feature.deleteTarget}
        isBulkDeleting={feature.isBulkDeleting}
        isDeleting={feature.isDeleting}
        onBulkDelete={feature.deleteSelectedProducts}
        onCloseBulkDelete={feature.closeBulkDeleteDialog}
        onCloseDelete={feature.closeDeleteDialog}
        onDelete={feature.deleteProduct}
        selectedCount={feature.selectedCount}
        translate={feature.translate}
      />
      <ProductInvoiceDialog
        busy={feature.invoiceBusy}
        error={feature.invoiceError}
        invoiceDescription={feature.invoiceDescription}
        invoiceName={feature.invoiceName}
        language={feature.language}
        onClose={feature.closeInvoiceDialog}
        onCreate={feature.createInvoice}
        onDescriptionChange={feature.changeInvoiceDescription}
        onNameChange={feature.changeInvoiceName}
        onQuantityChange={feature.changeInvoiceQuantity}
        open={feature.reportOpen}
        products={feature.reportProducts}
        quantities={feature.reportQuantities}
        total={feature.reportTotal}
        translate={feature.translate}
        validationShown={feature.invoiceValidationShown}
      />
    </section>
  );
}
