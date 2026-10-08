import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, LoaderCircle, MailCheck, XCircle } from 'lucide-react';
import { useI18n } from '@/app/utils/i18n';
import { useVerifyEmailMutation } from '../service/auth.service';

type VerificationState = 'pending' | 'success' | 'error';

/** Landing page opened from a registration verification email. */
export function VerifyEmailPage() {
  const { translate } = useI18n();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? searchParams.get('verify');
  const [verifyEmail] = useVerifyEmailMutation();
  const [state, setState] = useState<VerificationState>(token ? 'pending' : 'error');

  useEffect(() => {
    if (!token) return;
    let active = true;
    void verifyEmail(token).unwrap().then(
      () => { if (active) setState('success'); },
      () => { if (active) setState('error'); },
    );
    return () => { active = false; };
  }, [token, verifyEmail]);

  return (
    <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-xl flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-7 rounded-full border border-border bg-card p-6 shadow-sm">
        {state === 'pending' ? <LoaderCircle aria-hidden="true" className="size-12 animate-spin text-primary" />
          : state === 'success' ? <MailCheck aria-hidden="true" className="size-12 text-primary" />
            : <XCircle aria-hidden="true" className="size-12 text-destructive" />}
      </div>
      <h1 className="text-3xl font-semibold tracking-tight">
        {state === 'pending' ? translate('auth.confirmingEmail')
          : state === 'success' ? translate('auth.emailVerified') : translate('auth.verificationFailed')}
      </h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        {state === 'pending' ? translate('auth.confirmingDescription')
          : state === 'success' ? translate('auth.verifiedDescription')
            : translate('auth.failedDescription')}
      </p>
      {state !== 'pending' && (
        <Link to="/login" className="mt-8 inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground">
          {state === 'success' && <CheckCircle2 aria-hidden="true" className="size-4" />}
          {translate('auth.backToSignIn')}
        </Link>
      )}
    </section>
  );
}
