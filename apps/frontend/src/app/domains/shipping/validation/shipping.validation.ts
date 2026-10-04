import { z } from 'zod';
import type { Translate } from '@/app/locales/i18n';

export const createShippingValidation = (translate: Translate) => z.object({
  createdByUserId: z.string().min(1, translate('validation.selectUser')),
  recipient: z.object({
    name: z.string().trim().min(2, translate('validation.nameMin2')),
    address: z.string().trim().min(3, translate('validation.addressMin3')),
    city: z.string().trim().min(2, translate('validation.cityMin2')),
    country: z.string().trim().min(2, translate('validation.countryMin2')),
  }),
  invoiceIds: z.array(z.string().min(1)).min(1, translate('validation.selectInvoice')),
});
