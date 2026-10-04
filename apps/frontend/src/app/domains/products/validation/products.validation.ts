import { z } from 'zod';
import type { Translate } from '@/app/locales/i18n';

export const createProductValidation = (translate: Translate) => z.object({
  name: z.string().trim().min(2, translate('validation.min2')),
  price: z.coerce.number().min(0, translate('validation.priceNonNegative')),
  quantity: z.coerce.number().int().min(0, translate('validation.quantityNonNegative')),
  description: z.string().optional(),
  active: z.boolean().default(true),
});
