import { z } from 'zod';
import type { Translate } from '@/app/utils/i18n';

export const createProductValidation = (translate: Translate) => z.object({
  name: z.string().trim().min(2, translate('validation.min2')),
  price: z.preprocess(
    parseRequiredNumber,
    z.number({ error: translate('validation.priceInvalid') })
      .min(0, translate('validation.priceNonNegative'))
      .multipleOf(0.01, translate('validation.priceInvalid')),
  ),
  quantity: z.preprocess(
    parseRequiredNumber,
    z.number({ error: translate('validation.quantityInvalid') })
      .int(translate('validation.quantityInvalid'))
      .min(0, translate('validation.quantityNonNegative')),
  ),
  description: z.string().optional(),
  active: z.boolean().default(true),
});

function parseRequiredNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  return typeof value === 'string' && value.trim() !== '' ? Number(value) : NaN;
}
