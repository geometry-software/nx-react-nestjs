import {
  CheckCircle2,
  Info,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import {
  Alert,
  AlertDescription,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Tabs,
  TabsList,
  TabsTrigger,
} from 'geometry-sdk/components';
import type { SubmitEvent } from 'react';
import type { Translate } from '@/app/locales/locale';
import { AuthFormField } from './auth-form-field';

export function AuthFormCard({
  busy,
  invalidFields,
  fieldErrors,
  message,
  mode,
  onModeChange,
  onSubmit,
  success,
  translate,
}: {
  busy: boolean;
  invalidFields: ReadonlySet<string>;
  fieldErrors: Record<string, string>;
  message: string;
  mode: 'login' | 'register';
  onModeChange: (mode: 'login' | 'register') => void;
  onSubmit: (event: SubmitEvent<HTMLFormElement>) => void;
  success: boolean;
  translate: Translate;
}) {
  const submitLabel =
    mode === 'login' ? translate('auth.signInAction') : translate('auth.createAction');

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>
          {mode === 'login' ? translate('auth.signIn') : translate('auth.createAccount')}
        </CardTitle>
        <CardDescription>{translate('auth.chooseMethod')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <Tabs
          value={mode}
          onValueChange={(value) =>
            onModeChange(value as 'login' | 'register')
          }
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">{translate('auth.signIn')}</TabsTrigger>
            <TabsTrigger value="register">
              {translate('auth.createAccount')}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <form noValidate className="grid gap-4" onSubmit={onSubmit}>
          {mode === 'register' && (
            <AuthFormField
              autoComplete="name"
              icon={<UserRound />}
              error={fieldErrors.name}
              invalid={invalidFields.has('name')}
              label={translate('auth.fullName')}
              name="name"
              placeholder={translate('auth.namePlaceholder')}
              required
              requiredLabel={translate('common.required')}
            />
          )}
          <AuthFormField
            autoComplete="email"
            icon={<Mail />}
            error={fieldErrors.email}
            invalid={invalidFields.has('email')}
            label={translate('auth.email')}
            name="email"
            placeholder={translate('auth.emailPlaceholder')}
            required
            requiredLabel={translate('common.required')}
            type="email"
          />
          <AuthFormField
            autoComplete={
              mode === 'login' ? 'current-password' : 'new-password'
            }
            icon={<LockKeyhole />}
            error={fieldErrors.password}
            invalid={invalidFields.has('password')}
            label={translate('auth.password')}
            name="password"
            placeholder={translate('auth.passwordPlaceholder')}
            required
            requiredLabel={translate('common.required')}
            type="password"
          />

          {message && (
            <Alert variant={success ? 'default' : 'destructive'}>
              {success ? <CheckCircle2 /> : <Info />}
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <Button
            className="justify-self-end px-6"
            loading={busy}
            loadingLabel={translate('auth.wait')}
            size="lg"
            type="submit"
          >
            {submitLabel}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="gap-2 text-sm text-muted-foreground">
        <ShieldCheck />
        <span>
          <strong className="text-foreground">{translate('auth.encrypted')}</strong>{' '}
          {translate('auth.protected')}
        </span>
      </CardFooter>
    </Card>
  );
}
