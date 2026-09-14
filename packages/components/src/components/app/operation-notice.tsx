import { CheckCircle2, X } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';

type OperationNoticeProps = {
  message: string;
  closeLabel: string;
  onClose: () => void;
};

export function OperationNotice({
  message,
  closeLabel,
  onClose,
}: OperationNoticeProps) {
  return (
    <Alert className="fixed bottom-4 right-4 z-50 flex w-[min(28rem,calc(100%-2rem))] items-center gap-3 px-4 py-3">
      <span className="flex size-7 shrink-0 items-center justify-center">
        <CheckCircle2 aria-hidden="true" className="size-5" />
      </span>
      <AlertDescription className="flex min-w-0 flex-1 items-center justify-between gap-4">
        <span className="flex min-h-7 items-center leading-5">{message}</span>
        <Button
          aria-label={closeLabel}
          className="self-center"
          onClick={onClose}
          size="icon-sm"
          variant="ghost"
        >
          <X aria-hidden="true" />
        </Button>
      </AlertDescription>
    </Alert>
  );
}
