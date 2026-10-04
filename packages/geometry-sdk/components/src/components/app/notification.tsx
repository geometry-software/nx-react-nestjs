import { CheckCircle2, CircleX, X } from 'lucide-react';
import { cn } from 'cn';
import { Button } from '../ui/button.js';

export type NotificationPayload = {
  type: 'success' | 'error';
  message: string;
  title?: string;
};

export type NotificationLabels = {
  close: string;
  errorTitle: string;
  successTitle: string;
};

export function Notification({ payload, onClose, action, className, labels }: {
  payload: NotificationPayload;
  onClose?: () => void;
  action?: { label: string; onClick: () => void };
  className?: string;
  labels: NotificationLabels;
}) {
  const error = payload.type === 'error';
  const Icon = error ? CircleX : CheckCircle2;
  const tone = error ? 'text-[#B22222]' : 'text-[#228B22]';

  return (
    <div
      className={cn(
        'grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 rounded-lg border border-border bg-background px-4 py-3 shadow-lg',
        className,
      )}
      role={error ? 'alert' : 'status'}
    >
      <Icon aria-hidden="true" className={cn('mt-0.5 size-5 shrink-0', tone)} />
      <p className="min-w-0 break-words text-sm leading-5 text-muted-foreground">
        <span className="mr-2 font-semibold text-foreground">
          {payload.title ?? (error ? labels.errorTitle : labels.successTitle)}
        </span>
        {payload.message}
      </p>
      <div className="flex items-center gap-1">
        {action && (
          <Button onClick={action.onClick} size="sm" variant="outline">
            {action.label}
          </Button>
        )}
        {onClose && (
          <Button
            aria-label={labels.close}
            className="-mr-1"
            onClick={onClose}
            size="icon-sm"
            variant="ghost"
          >
            <X aria-hidden="true" />
          </Button>
        )}
      </div>
    </div>
  );
}
