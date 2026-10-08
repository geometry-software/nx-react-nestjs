import { useState } from 'react';
import { useNotification } from 'geometry-sdk/components';
import { useI18n } from '@/app/utils/i18n';
import { createAuthValidation } from '../validation/auth.validation';
import { useAuthService } from '../service/auth.service';
import type { LoginInput, RegisterInput } from '../models/auth.model';
import { executeRequest } from '@/app/utils/execute-request';

export function useAuthFeature() {
  const { language, translate } = useI18n();
  const { notifyError, notifySuccess } = useNotification();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState('viewer');
  const [message, setMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [invalidFields, setInvalidFields] = useState<Set<string>>(new Set());
  const { login, register, isLoggingIn, isRegistering } = useAuthService();

  const changeMode = (nextMode: 'login' | 'register') => {
    setMode(nextMode);
    setRole('viewer');
    setMessage('');
    setInvalidFields(new Set());
    setFieldErrors({});
  };

  async function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const raw = { ...Object.fromEntries(new FormData(event.currentTarget)), ...(mode === 'register' ? { role } : {}) };
    const parsed = createAuthValidation(translate, mode).safeParse(raw);
    if (!parsed.success) {
      setMessage('');
      notifyError(translate('common.validation'));
      setFieldErrors(Object.fromEntries(parsed.error.issues.map(({ path, message }) => [path.join('.'), message])));
      setInvalidFields(
        new Set(parsed.error.issues.map((issue) => String(issue.path[0]))),
      );
      return;
    }
    setInvalidFields(new Set());
    setFieldErrors({});
    const result = await executeRequest(() =>
      mode === 'login'
        ? login(parsed.data as LoginInput)
        : register({ ...(parsed.data as RegisterInput), language }),
    );
    if (!result.ok) {
      setMessage('');
      const status = result.error && typeof result.error === 'object' && 'status' in result.error
        ? result.error.status
        : undefined;
      notifyError(translate(
        status === 409
          ? 'auth.emailInUse'
          : status === 401
            ? 'auth.invalidCredentials'
            : 'auth.rejected',
      ));
      return;
    }
    if (mode === 'register') {
      setMessage('');
      notifySuccess(translate('auth.registrationSubmitted'));
      return;
    }
    setMessage(translate('auth.success', { token: result.data.accessToken.slice(0, 18) }));
  }

  return {
    translate,
    mode,
    role,
    message,
    invalidFields,
    fieldErrors,
    busy: isLoggingIn || isRegistering,
    changeMode,
    changeRole: setRole,
    submit,
  };
}
