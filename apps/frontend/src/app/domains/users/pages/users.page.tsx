import { UserDeleteDialogs } from '../components/user-delete-dialogs';
import { UserFormDialog } from '../components/user-form-dialog';
import { UsersFilters } from '../components/users-filters';
import { UsersHeader } from '../components/users-header';
import { UsersTable } from '../components/users-table';
import { useUsersFeature } from '../feature/users.feature';

export function Users() {
  const feature = useUsersFeature();
  return (
    <section className="space-y-6">
      <UsersHeader
        onDeleteSelected={feature.openBulkDeleteDialog}
        selectedCount={feature.selectedCount}
        translate={feature.translate}
      />
      <UsersFilters
        onChange={feature.changeFilter}
        onOrderChange={feature.changeOrder}
        onSearchChange={feature.changeSearch}
        query={feature.query}
        search={feature.search}
        translate={feature.translate}
      />
      <UsersTable
        data={feature.data}
        language={feature.language}
        loading={feature.isFetching}
        onDelete={feature.openDeleteDialog}
        onEdit={feature.openEditDialog}
        onPageChange={feature.changePage}
        onSelectedIdsChange={feature.changeSelection}
        pageSize={feature.pageSize}
        selectedIds={feature.selectedIds}
        translate={feature.translate}
      />
      <UserFormDialog
        editTarget={feature.editTarget}
        error={feature.error}
        invalidFields={feature.invalidFields}
        fieldErrors={feature.fieldErrors}
        isUpdating={feature.isUpdating}
        onClose={feature.closeEditDialog}
        onRoleChange={feature.changeRole}
        onSubmit={feature.submit}
        open={feature.dialogOpen}
        role={feature.role}
        translate={feature.translate}
      />
      <UserDeleteDialogs
        bulkDeleteError={feature.bulkDeleteError}
        bulkDeleteOpen={feature.bulkDeleteOpen}
        deleteError={feature.deleteError}
        deleteOpen={feature.deleteOpen}
        deleteTargetName={feature.deleteTargetName}
        isBulkDeleting={feature.isBulkDeleting}
        isDeleting={feature.isDeleting}
        onBulkDelete={feature.deleteSelectedUsers}
        onCloseBulkDelete={feature.closeBulkDeleteDialog}
        onCloseDelete={feature.closeDeleteDialog}
        onDelete={feature.deleteUser}
        selectedCount={feature.selectedCount}
        translate={feature.translate}
      />
    </section>
  );
}
