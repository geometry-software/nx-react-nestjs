import { useEffect } from 'react';
import { useNotification } from './use-notification.js';

type QueryErrorNotificationOptions = {
  isError: boolean;
  message: string;
  retryLabel: string;
  retry: () => unknown;
};

export function useQueryErrorNotification({
  isError,
  message,
  retryLabel,
  retry,
}: QueryErrorNotificationOptions) {
  const { notifyError } = useNotification();

  useEffect(() => {
    if (!isError) return;

    notifyError(message, {
      action: { label: retryLabel, onClick: () => void retry() },
      duration: 8000,
    });
  }, [isError, message, notifyError, retry, retryLabel]);
}
