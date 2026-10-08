import { ConfirmDialog } from 'geometry-sdk/components';
import type { Translate } from '@/app/locales/locale';

export function InvoiceStatusDialogs({
  cancelTargetName,
  confirmTargetName,
  isCancelling,
  isConfirming,
  cancelOpen,
  confirmOpen,
  onCancel,
  onCloseCancel,
  onCloseConfirm,
  onConfirm,
  translate,
}: {
  cancelTargetName: string;
  confirmTargetName: string;
  isCancelling: boolean;
  isConfirming: boolean;
  cancelOpen: boolean;
  confirmOpen: boolean;
  onCancel: () => void;
  onCloseCancel: () => void;
  onCloseConfirm: () => void;
  onConfirm: () => void;
  translate: Translate;
}) {
  return (
    <>
      <ConfirmDialog
        busy={isConfirming}
        itemName={confirmTargetName}
        labels={{
          title: translate('invoices.confirmTitle'),
          description: translate('invoices.confirmDescription'),
          warning: translate('invoices.confirmWarning'),
          cancel: translate('common.cancel'),
          deleting: translate('invoices.confirming'),
          confirmDelete: translate('invoices.confirmAction'),
        }}
        onClose={onCloseConfirm}
        onConfirm={onConfirm}
        open={confirmOpen}
        tone="confirm"
      />
      <ConfirmDialog
        busy={isCancelling}
        itemName={cancelTargetName}
        labels={{
          title: translate('invoices.cancelTitle'),
          description: translate('invoices.cancelDescription'),
          warning: translate('invoices.cancelWarning'),
          cancel: translate('common.cancel'),
          deleting: translate('invoices.cancelling'),
          confirmDelete: translate('invoices.cancelAction'),
        }}
        onClose={onCloseCancel}
        onConfirm={onCancel}
        open={cancelOpen}
      />
    </>
  );
}
