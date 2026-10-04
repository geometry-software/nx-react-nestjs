import { z } from 'zod';
import type { Translate } from '@/app/locales/i18n';

export const createInvoiceUpdateValidation = (translate: Translate) => z.object({
  name: z.string().trim().min(2, translate('validation.min2')),
  description: z.string().trim(),
});
