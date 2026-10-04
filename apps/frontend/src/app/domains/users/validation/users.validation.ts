import { z } from 'zod';
import type { Translate } from '@/app/locales/i18n';

export const createUserValidation = (translate: Translate) => z.object({
  name: z.string().trim().min(2, translate('validation.min2')),
  email: z.email(translate('validation.invalidEmail')),
  role: z.enum(['admin', 'manager', 'viewer']),
  active: z.boolean().default(true),
});
