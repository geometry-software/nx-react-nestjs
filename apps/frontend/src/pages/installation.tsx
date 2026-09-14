import type { ReactNode } from 'react';
import { Badge } from '@nx-react-nestjs/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@nx-react-nestjs/components/ui/card';
import { useI18n } from '../app/i18n';

const NODE_URL = 'https://nodejs.org/en/download';
const REPOSITORY_URL =
  'https://github.com/geometry-software/nx-react-nestjs';

export function Installation() {
  const { t } = useI18n();

  return (
    <div className="space-y-8">
      <header>
        <Badge variant="secondary">{t('installation.eyebrow')}</Badge>
        <h1 className="mt-4 text-4xl font-bold tracking-tight">
          {t('installation.title')}
        </h1>
        <p className="mt-2 max-w-3xl text-lg text-muted-foreground">
          {t('installation.subtitle')}
        </p>
      </header>

      <div className="grid gap-5">
        <InstallationStep
          number="01"
          title={t('installation.stepNode')}
          description={t('installation.stepNodeText')}
        >
          <div className="rounded-xl bg-muted p-4">
            <ExternalLink href={NODE_URL}>{NODE_URL}</ExternalLink>
          </div>
        </InstallationStep>

        <InstallationStep
          number="02"
          title={t('installation.stepClone')}
          description={t('installation.stepCloneText')}
        >
          <div className="rounded-xl bg-muted p-4">
            <ExternalLink href={REPOSITORY_URL}>
              {REPOSITORY_URL}
            </ExternalLink>
          </div>
        </InstallationStep>

        <InstallationStep
          number="03"
          title={t('installation.stepStartAll')}
          description={t('installation.stepStartAllText')}
        >
          <CodeBlock>npm start</CodeBlock>
        </InstallationStep>
      </div>

    </div>
  );
}

function InstallationStep({
  number,
  title,
  description,
  children,
}: {
  number: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 font-semibold text-primary">
            {number}
          </span>
          <div className="space-y-1">
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function ExternalLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      className="inline-flex items-center gap-2 font-medium text-primary underline underline-offset-4"
      href={href}
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm leading-6">
      <code>{children}</code>
    </pre>
  );
}
