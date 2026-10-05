import {
  createContext,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Notification,
  type NotificationLabels,
  type NotificationPayload,
} from '../app/notification.js';

export type NotificationAction = {
  label: string;
  onClick: () => void;
};

export type NotificationOptions = {
  action?: NotificationAction;
  duration?: number;
  title?: string;
};

type NotificationEntry = {
  action?: NotificationAction;
  id: number;
  payload: NotificationPayload;
};

export type NotificationContextValue = {
  dismissNotification: (id: number) => void;
  notifyError: (message: string, options?: NotificationOptions) => number;
  notifySuccess: (message: string, options?: NotificationOptions) => number;
};

export const NotificationContext =
  createContext<NotificationContextValue | null>(null);
let nextNotificationId = 0;

export function NotificationProvider({
  children,
  labels,
}: {
  children: ReactNode;
  labels: NotificationLabels;
}) {
  const [notifications, setNotifications] = useState<NotificationEntry[]>([]);
  const timers = useRef(new Map<number, number>());

  const dismissNotification = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer !== undefined) window.clearTimeout(timer);
    timers.current.delete(id);
    setNotifications((current) => current.filter((item) => item.id !== id));
  }, []);

  const showNotification = useCallback(
    (
      type: NotificationPayload['type'],
      message: string,
      options: NotificationOptions = {},
    ) => {
      const id = ++nextNotificationId;
      const { action, duration = 5000, title } = options;
      setNotifications((current) => [
        ...current,
        {
          id,
          payload: { type, message, ...(title ? { title } : {}) },
          ...(action ? { action } : {}),
        },
      ]);

      if (duration > 0) {
        timers.current.set(
          id,
          window.setTimeout(() => dismissNotification(id), duration),
        );
      }

      return id;
    },
    [dismissNotification],
  );

  const value = useMemo<NotificationContextValue>(
    () => ({
      dismissNotification,
      notifyError: (message, options) =>
        showNotification('error', message, options),
      notifySuccess: (message, options) =>
        showNotification('success', message, options),
    }),
    [dismissNotification, showNotification],
  );

  useEffect(
    () => () => {
      for (const timer of timers.current.values()) window.clearTimeout(timer);
      timers.current.clear();
    },
    [],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="fixed right-4 bottom-4 z-100 grid w-[calc(100vw-2rem)] max-w-lg gap-2"
      >
        {notifications.map(({ id, payload, action }) => (
          <Notification
            action={
              action
                ? {
                    label: action.label,
                    onClick: () => {
                      action.onClick();
                      dismissNotification(id);
                    },
                  }
                : undefined
            }
            key={id}
            labels={labels}
            onClose={() => dismissNotification(id)}
            payload={payload}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}
