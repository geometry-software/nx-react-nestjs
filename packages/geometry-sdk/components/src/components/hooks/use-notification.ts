import { createRequiredContextHook } from './create-required-context-hook.js';
import { NotificationContext } from '../providers/notification-provider.js';

export const useNotification = createRequiredContextHook(
  NotificationContext,
  'useNotification must be used within NotificationProvider.',
);
