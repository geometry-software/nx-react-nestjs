import type { Translate } from '@/app/locales/locale';

export function InvoicesHeader({ translate }: { translate: Translate }) {
  return (
    <header>
      <h1 className="text-4xl font-bold tracking-tight">
        {translate('invoices.title')}
      </h1>
      <p className="mt-2 text-muted-foreground">
        {translate('invoices.subtitle')}
      </p>
    </header>
  );
}
