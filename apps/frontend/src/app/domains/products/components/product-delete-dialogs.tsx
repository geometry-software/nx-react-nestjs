import { ConfirmDialog } from 'geometry-sdk/components';
import { confirmDialogLabels } from '@/app/utils/i18n-labels';
import type { Product } from '../models/products.model';
import type { Translate } from '@/app/locales/locale';

export function ProductDeleteDialogs({
  bulkDeleteOpen,
  deleteTarget,
  isBulkDeleting,
  isDeleting,
  onBulkDelete,
  onCloseBulkDelete,
  onCloseDelete,
  onDelete,
  selectedCount,
  translate,
}: {
  bulkDeleteOpen: boolean;
  deleteTarget: Product | null;
  isBulkDeleting: boolean;
  isDeleting: boolean;
  onBulkDelete: () => void;
  onCloseBulkDelete: () => void;
  onCloseDelete: () => void;
  onDelete: () => void;
  selectedCount: number;
  translate: Translate;
}) {
  const labels = confirmDialogLabels(translate);

  return (
    <>
      <ConfirmDialog
        busy={isDeleting}
        itemName={deleteTarget?.name ?? ''}
        labels={labels}
        onClose={onCloseDelete}
        onConfirm={onDelete}
        open={Boolean(deleteTarget)}
      />
      <ConfirmDialog
        busy={isBulkDeleting}
        itemName={translate('common.selectedItems', { count: selectedCount })}
        labels={labels}
        onClose={onCloseBulkDelete}
        onConfirm={onBulkDelete}
        open={bulkDeleteOpen}
      />
    </>
  );
}
