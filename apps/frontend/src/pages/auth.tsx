import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { useState, type ComponentProps, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ButtonLoader } from '@nx-react-nestjs/components/app/button-loader';
import { Button } from '@nx-react-nestjs/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@nx-react-nestjs/components/ui/card';
import { Input } from '@nx-react-nestjs/components/ui/input';
import { Label } from '@nx-react-nestjs/components/ui/label';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@nx-react-nestjs/components/ui/tabs';
import { useI18n } from '../app/i18n';
import { loginSchema, registerSchema } from '@/lib/schemas';
import { useLoginMutation, useRegisterMutation } from '@/services/api';

export function Auth() {
  const { t } = useI18n();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [invalidFields, setInvalidFields] = useState<Set<string>>(new Set());
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const [register, { isLoading: isRegistering }] = useRegisterMutation();
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const raw = Object.fromEntries(new FormData(event.currentTarget));
    const parsed = (mode === 'login' ? loginSchema : registerSchema).safeParse(
      raw,
    );
    if (!parsed.success) {
      setSuccess(false);
      setMessage(t('common.validation'));
      setInvalidFields(
        new Set(parsed.error.issues.map((issue) => String(issue.path[0]))),
      );
      return;
    }
    setInvalidFields(new Set());
    try {
      const result =
        mode === 'login'
          ? await login(
              parsed.data as { email: string; password: string },
            ).unwrap()
          : await register(
              parsed.data as { name: string; email: string; password: string },
            ).unwrap();
      setSuccess(true);
      setMessage(t('auth.success', { token: result.accessToken.slice(0, 18) }));
    } catch {
      setSuccess(false);
      setMessage(t('auth.rejected'));
    }
  }
  const busy = isLoggingIn || isRegistering;
  return (
    <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-5xl items-center gap-8 p-4 md:grid-cols-2 md:p-8">
      <div className="space-y-6">
        <Button asChild size="lg" variant="outline">
          <Link to="/products?page=1&limit=10&sort=createdAt&order=desc">
            <ArrowLeft />
            {t('auth.back')}
          </Link>
        </Button>
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          {t('auth.title')}
        </h1>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>
            {mode === 'login' ? t('auth.signIn') : t('auth.createAccount')}
          </CardTitle>
          <CardDescription>{t('auth.chooseMethod')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <Tabs
            value={mode}
            onValueChange={(value) => {
              setMode(value as 'login' | 'register');
              setMessage('');
              setInvalidFields(new Set());
            }}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">{t('auth.signIn')}</TabsTrigger>
              <TabsTrigger value="register">
                {t('auth.createAccount')}
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <form className="grid gap-4" onSubmit={submit}>
            {mode === 'register' && (
              <FormInput
                icon={<UserRound />}
                label={t('auth.fullName')}
                name="name"
                placeholder="John Doe"
                autoComplete="name"
                invalid={invalidFields.has('name')}
              />
            )}
            <FormInput
              icon={<Mail />}
              label={t('auth.email')}
              name="email"
              placeholder="john@company.com"
              type="email"
              autoComplete="email"
              invalid={invalidFields.has('email')}
            />
            <FormInput
              icon={<LockKeyhole />}
              label={t('auth.password')}
              name="password"
              placeholder={t('auth.passwordPlaceholder')}
              type="password"
              autoComplete={
                mode === 'login' ? 'current-password' : 'new-password'
              }
              invalid={invalidFields.has('password')}
            />
            {message && (
              <Alert variant={success ? 'default' : 'destructive'}>
                {success ? <CheckCircle2 /> : <Info />}
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
            <Button disabled={busy} size="lg" type="submit">
              {busy ? <ButtonLoader /> : <ArrowRight />}
              {busy
                ? t('auth.wait')
                : mode === 'login'
                  ? t('auth.signInAction')
                  : t('auth.createAction')}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="gap-2 text-sm text-muted-foreground">
          <ShieldCheck />
          <span>
            <strong className="text-foreground">{t('auth.encrypted')}</strong>{' '}
            {t('auth.protected')}
          </span>
        </CardFooter>
      </Card>
    </section>
  );
}

function FormInput({
  icon,
  label,
  invalid = false,
  ...props
}: ComponentProps<typeof Input> & {
  icon: ReactNode;
  label: string;
  invalid?: boolean;
}) {
  const id = `auth-${props.name}`;
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <span className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground">
          {icon}
        </span>
        <Input {...props} aria-invalid={invalid} className="pl-9" id={id} />
      </div>
    </div>
  );
}
