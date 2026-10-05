import { DesignSystemView } from '../components/design-system-view';
import { getDesignSystemFeature } from '../feature/project-info.feature';

export function DesignSystem() {
  const feature = getDesignSystemFeature();

  return (
    <DesignSystemView
      autocompleteOptions={feature.autocompleteOptions}
      autocompleteSelectedValue={feature.autocompleteSelectedValue}
      autocompleteValue={feature.autocompleteValue}
      confirmOpen={feature.confirmOpen}
      deleteOpen={feature.deleteOpen}
      entityCategory={feature.entityCategory}
      entityOpen={feature.entityOpen}
      onAutocompleteSearch={feature.searchAutocomplete}
      onAutocompleteSelect={feature.selectAutocomplete}
      onConfirmOpenChange={feature.setConfirmOpen}
      onDeleteOpenChange={feature.setDeleteOpen}
      onEntityCategoryChange={feature.setEntityCategory}
      onEntityOpenChange={feature.setEntityOpen}
      onPageChange={feature.setPage}
      onSelectedRowsChange={feature.setSelectedRows}
      onSortChange={feature.setSort}
      page={feature.page}
      rows={feature.rows}
      selectedRows={feature.selectedRows}
      sort={feature.sort}
      sortOptions={feature.sortOptions}
      translate={feature.translate}
    />
  );
}
