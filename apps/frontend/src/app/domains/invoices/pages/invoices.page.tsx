import { InvoiceEditDialog } from '../components/invoice-edit-dialog';
import { InvoiceStatusDialogs } from '../components/invoice-status-dialogs';
import { InvoicesFilters } from '../components/invoices-filters';
import { InvoicesHeader } from '../components/invoices-header';
import { InvoicesTable } from '../components/invoices-table';
import { useInvoicesPage } from './invoices.page.ts';

export function Invoices() {
  const model = useInvoicesPage();
  return (
    <section className="space-y-6">
      <InvoicesHeader translate={model.translate} />
      <InvoicesFilters
        onChange={model.changeFilter}
        onOrderChange={model.changeOrder}
        onSearchChange={model.changeSearch}
        query={model.query}
        search={model.search}
        translate={model.translate}
      />
      <InvoicesTable
        data={model.data}
        language={model.language}
        loading={model.isFetching}
        onCancel={model.openCancelDialog}
        onConfirm={model.openConfirmDialog}
        onEdit={model.openEditDialog}
        onPageChange={model.changePage}
        onPrint={model.printInvoice}
        pageSize={model.pageSize}
        translate={model.translate}
      />
      <InvoiceEditDialog
        editTarget={model.editTarget}
        error={model.error}
        isUpdating={model.isUpdating}
        onClose={model.closeEditDialog}
        onSubmit={model.submitEdit}
        translate={model.translate}
      />
      <InvoiceStatusDialogs
        actionError={model.actionError}
        cancelOpen={model.cancelOpen}
        cancelTargetName={model.cancelTargetName}
        confirmOpen={model.confirmOpen}
        confirmTargetName={model.confirmTargetName}
        isCancelling={model.isCancelling}
        isConfirming={model.isConfirming}
        onCancel={model.cancelInvoice}
        onCloseCancel={model.closeCancelDialog}
        onCloseConfirm={model.closeConfirmDialog}
        onConfirm={model.confirmInvoice}
        translate={model.translate}
      />
    </section>
  );
}
