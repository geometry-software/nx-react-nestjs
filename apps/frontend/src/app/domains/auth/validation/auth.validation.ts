import { z } from 'zod';
import type { Translate } from '@/app/utils/i18n';

export const createAuthValidation = (translate: Translate, mode: 'login' | 'register') => {
  const loginValidation = z.object({
    email: z.email(translate('validation.invalidEmail')),
    password: z.string().min(8, translate('validation.min8')),
  });

  return mode === 'login'
    ? loginValidation
    : loginValidation.extend({
        name: z.string().trim().min(2, translate('validation.min2')),
      });
};
