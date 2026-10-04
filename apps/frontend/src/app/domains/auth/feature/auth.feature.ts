import { useState } from 'react';
import { useI18n } from '@/app/locales/i18n';
import { createAuthValidation } from '../validation/auth.validation';
import { useAuthService } from '../service/auth.service';
import type { LoginInput, RegisterInput } from '../models/auth.model';
import { executeRequest } from '@/app/utils/execute-request';

export function useAuthFeature() {
  const { translate } = useI18n();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [invalidFields, setInvalidFields] = useState<Set<string>>(new Set());
  const { login, register, isLoggingIn, isRegistering } = useAuthService();

  const changeMode = (nextMode: 'login' | 'register') => {
    setMode(nextMode);
    setMessage('');
    setInvalidFields(new Set());
  };

  async function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const raw = Object.fromEntries(new FormData(event.currentTarget));
    const parsed = createAuthValidation(translate, mode).safeParse(raw);
    if (!parsed.success) {
      setSuccess(false);
      setMessage(translate('common.validation'));
      setInvalidFields(
        new Set(parsed.error.issues.map((issue) => String(issue.path[0]))),
      );
      return;
    }
    setInvalidFields(new Set());
    const result = await executeRequest(() =>
      mode === 'login'
        ? login(parsed.data as LoginInput)
        : register(parsed.data as RegisterInput),
    );
    if (!result.ok) {
      setSuccess(false);
      setMessage(translate('auth.rejected'));
      return;
    }
    setSuccess(true);
    setMessage(
      translate('auth.success', {
        token: result.data.accessToken.slice(0, 18),
      }),
    );
  }

  return {
    translate,
    mode,
    message,
    success,
    invalidFields,
    busy: isLoggingIn || isRegistering,
    changeMode,
    submit,
  };
}
