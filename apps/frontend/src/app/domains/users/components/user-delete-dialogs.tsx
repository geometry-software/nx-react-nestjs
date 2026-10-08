import { ConfirmDialog } from 'geometry-sdk/components';
import { confirmDialogLabels } from '@/app/utils/i18n-labels';
import type { Translate } from '@/app/locales/locale';

export function UserDeleteDialogs({
  bulkDeleteOpen,
  deleteOpen,
  deleteTargetName,
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
  deleteOpen: boolean;
  deleteTargetName: string;
  isBulkDeleting: boolean;
  isDeleting: boolean;
  onBulkDelete: () => void;
  onCloseBulkDelete: () => void;
  onCloseDelete: () => void;
  onDelete: () => void;
  selectedCount: number;
  translate: Translate;
}) {
  return (
    <>
      <ConfirmDialog
        busy={isDeleting}
        itemName={deleteTargetName}
        labels={confirmDialogLabels(translate)}
        onClose={onCloseDelete}
        onConfirm={onDelete}
        open={deleteOpen}
      />
      <ConfirmDialog
        busy={isBulkDeleting}
        itemName={translate('common.selectedItems', { count: selectedCount })}
        labels={confirmDialogLabels(translate)}
        onClose={onCloseBulkDelete}
        onConfirm={onBulkDelete}
        open={bulkDeleteOpen}
      />
    </>
  );
}
