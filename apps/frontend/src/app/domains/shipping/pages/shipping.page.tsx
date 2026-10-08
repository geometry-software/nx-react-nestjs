import { ShipmentCreateDialog } from '../components/shipment-create-dialog';
import { ShipmentDeleteDialogs } from '../components/shipment-delete-dialogs';
import { ShipmentDetailsDialog } from '../components/shipment-details-dialog';
import { ShippingFilters } from '../components/shipping-filters';
import { ShippingHeader } from '../components/shipping-header';
import { ShippingTable } from '../components/shipping-table';
import { useShippingFeature } from '../feature/shipping.feature';

export function Shipping() {
  const feature = useShippingFeature();
  return (
    <section className="space-y-6">
      <ShippingHeader
        onAdd={feature.openCreateDialog}
        onDeleteSelected={feature.openBulkDeleteDialog}
        selectedCount={feature.selectedCount}
        translate={feature.translate}
      />
      <ShippingFilters
        onChange={feature.changeFilter}
        onSearchChange={feature.changeSearch}
        query={feature.query}
        search={feature.search}
        translate={feature.translate}
      />
      <ShippingTable
        data={feature.data}
        language={feature.language}
        loading={feature.isFetching}
        onDelete={feature.openDeleteDialog}
        onOpenDetails={feature.openDetailsDialog}
        onPageChange={feature.changePage}
        onSelectedIdsChange={feature.changeSelection}
        pageSize={feature.pageSize}
        selectedIds={feature.selectedIds}
        translate={feature.translate}
      />
      <ShipmentCreateDialog
        cities={feature.cities}
        citiesLoading={feature.citiesLoading}
        countries={feature.countries}
        countriesLoading={feature.countriesLoading}
        fieldErrors={feature.fieldErrors}
        invalidFields={feature.invalidFields}
        invoices={feature.invoices}
        invoicesLoading={feature.invoicesLoading}
        isCreating={feature.isCreating}
        language={feature.language}
        onCitySearch={feature.searchCity}
        onCitySelect={feature.selectCity}
        onClose={feature.closeCreateDialog}
        onCountrySearch={feature.searchCountry}
        onCountrySelect={feature.selectCountry}
        onInvoiceToggle={feature.toggleInvoice}
        onRecipientChange={feature.updateRecipient}
        onSubmit={feature.submit}
        onUserSelect={feature.selectUser}
        open={feature.createOpen}
        recipient={feature.recipient}
        selectedCountryCode={feature.selectedCountryCode}
        selectedInvoiceIds={feature.selectedInvoiceIds}
        selectedUserId={feature.selectedUserId}
        translate={feature.translate}
        users={feature.users}
        usersLoading={feature.usersLoading}
      />
      <ShipmentDetailsDialog
        description={feature.detailsDescription}
        isRefreshing={feature.isRefreshing}
        language={feature.language}
        onClose={feature.closeDetailsDialog}
        onRefresh={feature.syncTracking}
        shipment={feature.detailsTarget}
        translate={feature.translate}
      />
      <ShipmentDeleteDialogs
        bulkDeleteOpen={feature.bulkDeleteOpen}
        deleteOpen={feature.deleteOpen}
        deleteTargetName={feature.deleteTargetName}
        isBulkDeleting={feature.isBulkDeleting}
        isDeleting={feature.isDeleting}
        onBulkDelete={feature.deleteSelectedShipments}
        onCloseBulkDelete={feature.closeBulkDeleteDialog}
        onCloseDelete={feature.closeDeleteDialog}
        onDelete={feature.deleteShipment}
        selectedCount={feature.selectedCount}
        translate={feature.translate}
      />
    </section>
  );
}
