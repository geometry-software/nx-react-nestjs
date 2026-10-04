import {
  ArrowRight,
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
  message,
  mode,
  onModeChange,
  onSubmit,
  success,
  translate,
}: {
  busy: boolean;
  invalidFields: ReadonlySet<string>;
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

        <form className="grid gap-4" onSubmit={onSubmit}>
          {mode === 'register' && (
            <AuthFormField
              autoComplete="name"
              icon={<UserRound />}
              invalid={invalidFields.has('name')}
              label={translate('auth.fullName')}
              name="name"
              placeholder={translate('auth.namePlaceholder')}
            />
          )}
          <AuthFormField
            autoComplete="email"
            icon={<Mail />}
            invalid={invalidFields.has('email')}
            label={translate('auth.email')}
            name="email"
            placeholder={translate('auth.emailPlaceholder')}
            type="email"
          />
          <AuthFormField
            autoComplete={
              mode === 'login' ? 'current-password' : 'new-password'
            }
            icon={<LockKeyhole />}
            invalid={invalidFields.has('password')}
            label={translate('auth.password')}
            name="password"
            placeholder={translate('auth.passwordPlaceholder')}
            type="password"
          />

          {message && (
            <Alert variant={success ? 'default' : 'destructive'}>
              {success ? <CheckCircle2 /> : <Info />}
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <Button
            loading={busy}
            loadingLabel={translate('auth.wait')}
            size="lg"
            type="submit"
          >
            <ArrowRight />
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
