import { DesignSystemView } from '../components/design-system-view';
import { useDesignSystemPage } from './design-system.page.ts';

export function DesignSystem() {
  const model = useDesignSystemPage();

  return (
    <DesignSystemView
      autocompleteOptions={model.autocompleteOptions}
      autocompleteSelectedValue={model.autocompleteSelectedValue}
      autocompleteValue={model.autocompleteValue}
      componentCount={model.componentCount}
      confirmOpen={model.confirmOpen}
      deleteOpen={model.deleteOpen}
      entityCategory={model.entityCategory}
      entityOpen={model.entityOpen}
      onAutocompleteSearch={model.searchAutocomplete}
      onAutocompleteSelect={model.selectAutocomplete}
      onConfirmOpenChange={model.setConfirmOpen}
      onDeleteOpenChange={model.setDeleteOpen}
      onEntityCategoryChange={model.setEntityCategory}
      onEntityOpenChange={model.setEntityOpen}
      onPageChange={model.setPage}
      onSelectedRowsChange={model.setSelectedRows}
      onSortChange={model.setSort}
      page={model.page}
      rows={model.rows}
      selectedRows={model.selectedRows}
      sort={model.sort}
      sortOptions={model.sortOptions}
      translate={model.translate}
    />
  );
}
