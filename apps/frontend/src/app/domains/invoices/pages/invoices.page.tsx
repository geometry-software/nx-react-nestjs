import { InvoiceEditDialog } from '../components/invoice-edit-dialog';
import { InvoiceStatusDialogs } from '../components/invoice-status-dialogs';
import { InvoicesFilters } from '../components/invoices-filters';
import { InvoicesHeader } from '../components/invoices-header';
import { InvoicesTable } from '../components/invoices-table';
import { useInvoicesFeature } from '../feature/invoices.feature';

export function Invoices() {
  const feature = useInvoicesFeature();
  return (
    <section className="space-y-6">
      <InvoicesHeader translate={feature.translate} />
      <InvoicesFilters
        onChange={feature.changeFilter}
        onOrderChange={feature.changeOrder}
        onSearchChange={feature.changeSearch}
        query={feature.query}
        search={feature.search}
        translate={feature.translate}
      />
      <InvoicesTable
        data={feature.data}
        language={feature.language}
        loading={feature.isFetching}
        onCancel={feature.openCancelDialog}
        onConfirm={feature.openConfirmDialog}
        onEdit={feature.openEditDialog}
        onPageChange={feature.changePage}
        onPrint={feature.printInvoice}
        pageSize={feature.pageSize}
        translate={feature.translate}
      />
      <InvoiceEditDialog
        editTarget={feature.editTarget}
        fieldErrors={feature.fieldErrors}
        isUpdating={feature.isUpdating}
        onClose={feature.closeEditDialog}
        onSubmit={feature.submitEdit}
        translate={feature.translate}
      />
      <InvoiceStatusDialogs
        cancelOpen={feature.cancelOpen}
        cancelTargetName={feature.cancelTargetName}
        confirmOpen={feature.confirmOpen}
        confirmTargetName={feature.confirmTargetName}
        isCancelling={feature.isCancelling}
        isConfirming={feature.isConfirming}
        onCancel={feature.cancelInvoice}
        onCloseCancel={feature.closeCancelDialog}
        onCloseConfirm={feature.closeConfirmDialog}
        onConfirm={feature.confirmInvoice}
        translate={feature.translate}
      />
    </section>
  );
}
