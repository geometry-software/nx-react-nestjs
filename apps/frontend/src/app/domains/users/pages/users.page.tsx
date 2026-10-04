import { UserDeleteDialogs } from '../components/user-delete-dialogs';
import { UserFormDialog } from '../components/user-form-dialog';
import { UsersFilters } from '../components/users-filters';
import { UsersHeader } from '../components/users-header';
import { UsersTable } from '../components/users-table';
import { useUsersPage } from './users.page.ts';

export function Users() {
  const model = useUsersPage();
  return (
    <section className="space-y-6">
      <UsersHeader
        onDeleteSelected={model.openBulkDeleteDialog}
        selectedCount={model.selectedCount}
        translate={model.translate}
      />
      <UsersFilters
        onChange={model.changeFilter}
        onOrderChange={model.changeOrder}
        onSearchChange={model.changeSearch}
        query={model.query}
        search={model.search}
        translate={model.translate}
      />
      <UsersTable
        data={model.data}
        language={model.language}
        loading={model.isFetching}
        onDelete={model.openDeleteDialog}
        onEdit={model.openEditDialog}
        onPageChange={model.changePage}
        onSelectedIdsChange={model.changeSelection}
        pageSize={model.pageSize}
        selectedIds={model.selectedIds}
        translate={model.translate}
      />
      <UserFormDialog
        editTarget={model.editTarget}
        error={model.error}
        invalidFields={model.invalidFields}
        isUpdating={model.isUpdating}
        onClose={model.closeEditDialog}
        onRoleChange={model.changeRole}
        onSubmit={model.submit}
        open={model.dialogOpen}
        role={model.role}
        translate={model.translate}
      />
      <UserDeleteDialogs
        bulkDeleteError={model.bulkDeleteError}
        bulkDeleteOpen={model.bulkDeleteOpen}
        deleteError={model.deleteError}
        deleteOpen={model.deleteOpen}
        deleteTargetName={model.deleteTargetName}
        isBulkDeleting={model.isBulkDeleting}
        isDeleting={model.isDeleting}
        onBulkDelete={model.deleteSelectedUsers}
        onCloseBulkDelete={model.closeBulkDeleteDialog}
        onCloseDelete={model.closeDeleteDialog}
        onDelete={model.deleteUser}
        selectedCount={model.selectedCount}
        translate={model.translate}
      />
    </section>
  );
}
