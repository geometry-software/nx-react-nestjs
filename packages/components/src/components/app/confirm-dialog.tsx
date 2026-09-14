import { AlertTriangle, CheckCircle2, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Alert, AlertDescription } from '../ui/alert';
import { ButtonLoader } from './button-loader';

export function ConfirmDialog({
  open,
  itemName,
  busy,
  error,
  onClose,
  onConfirm,
  labels,
  tone = 'destructive',
}: {
  open: boolean;
  itemName: string;
  busy: boolean;
  error?: string;
  onClose: () => void;
  onConfirm: () => void;
  labels: {
    title: string;
    description: string;
    note?: string;
    warning?: string;
    cancel: string;
    pending?: string;
    deleting?: string;
    confirm?: string;
    confirmDelete?: string;
  };
  tone?: 'destructive' | 'confirm';
}) {
  const isConfirm = tone === 'confirm';
  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => !next && !busy && onClose()}
    >
      <AlertDialogContent onOverlayClick={() => !busy && onClose()}>
        <AlertDialogHeader>
          <AlertDialogMedia
            className={
              isConfirm
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-destructive'
            }
          >
            {isConfirm ? <CheckCircle2 /> : <AlertTriangle />}
          </AlertDialogMedia>
          <AlertDialogTitle>{labels.title}</AlertDialogTitle>
          <AlertDialogDescription>
            {labels.description.replace('{{name}}', itemName)}{' '}
            {labels.note ?? labels.warning}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>{labels.cancel}</AlertDialogCancel>
          <AlertDialogAction
            disabled={busy}
            onClick={onConfirm}
            variant={isConfirm ? 'default' : 'destructive'}
          >
            {busy ? (
              <ButtonLoader />
            ) : isConfirm ? (
              <CheckCircle2 />
            ) : (
              <Trash2 />
            )}
            {busy
              ? (labels.pending ?? labels.deleting)
              : (labels.confirm ?? labels.confirmDelete)}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
