import { ShipmentCreateDialog } from '../components/shipment-create-dialog';
import { ShipmentDeleteDialogs } from '../components/shipment-delete-dialogs';
import { ShipmentDetailsDialog } from '../components/shipment-details-dialog';
import { ShippingFilters } from '../components/shipping-filters';
import { ShippingHeader } from '../components/shipping-header';
import { ShippingTable } from '../components/shipping-table';
import { useShippingPage } from './shipping.page.ts';

export function Shipping() {
  const model = useShippingPage();
  return (
    <section className="space-y-6">
      <ShippingHeader
        onAdd={model.openCreateDialog}
        onDeleteSelected={model.openBulkDeleteDialog}
        selectedCount={model.selectedCount}
        translate={model.translate}
      />
      <ShippingFilters
        onChange={model.changeFilter}
        onSearchChange={model.changeSearch}
        query={model.query}
        search={model.search}
        translate={model.translate}
      />
      <ShippingTable
        data={model.data}
        language={model.language}
        loading={model.isFetching}
        onDelete={model.openDeleteDialog}
        onOpenDetails={model.openDetailsDialog}
        onPageChange={model.changePage}
        onSelectedIdsChange={model.changeSelection}
        pageSize={model.pageSize}
        selectedIds={model.selectedIds}
        translate={model.translate}
      />
      <ShipmentCreateDialog
        cities={model.cities}
        citiesLoading={model.citiesLoading}
        countries={model.countries}
        countriesLoading={model.countriesLoading}
        error={model.error}
        fieldErrors={model.fieldErrors}
        invalidFields={model.invalidFields}
        invoices={model.invoices}
        invoicesLoading={model.invoicesLoading}
        isCreating={model.isCreating}
        language={model.language}
        onCitySearch={model.searchCity}
        onCitySelect={model.selectCity}
        onClose={model.closeCreateDialog}
        onCountrySearch={model.searchCountry}
        onCountrySelect={model.selectCountry}
        onInvoiceToggle={model.toggleInvoice}
        onRecipientChange={model.updateRecipient}
        onSubmit={model.submit}
        onUserSelect={model.selectUser}
        open={model.createOpen}
        recipient={model.recipient}
        selectedCountryCode={model.selectedCountryCode}
        selectedInvoiceIds={model.selectedInvoiceIds}
        selectedUserId={model.selectedUserId}
        translate={model.translate}
        users={model.users}
        usersLoading={model.usersLoading}
      />
      <ShipmentDetailsDialog
        description={model.detailsDescription}
        error={model.error}
        isRefreshing={model.isRefreshing}
        language={model.language}
        onClose={model.closeDetailsDialog}
        onRefresh={model.syncTracking}
        shipment={model.detailsTarget}
        translate={model.translate}
      />
      <ShipmentDeleteDialogs
        bulkDeleteError={model.bulkDeleteError}
        bulkDeleteOpen={model.bulkDeleteOpen}
        deleteError={model.deleteError}
        deleteOpen={model.deleteOpen}
        deleteTargetName={model.deleteTargetName}
        isBulkDeleting={model.isBulkDeleting}
        isDeleting={model.isDeleting}
        onBulkDelete={model.deleteSelectedShipments}
        onCloseBulkDelete={model.closeBulkDeleteDialog}
        onCloseDelete={model.closeDeleteDialog}
        onDelete={model.deleteShipment}
        selectedCount={model.selectedCount}
        translate={model.translate}
      />
    </section>
  );
}
