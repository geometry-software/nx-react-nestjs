import { Trash2 } from 'lucide-react';
import { Button } from 'geometry-sdk/components';
import type { Translate } from '@/app/locales/locale';

export function UsersHeader({
  onDeleteSelected,
  selectedCount,
  translate,
}: {
  onDeleteSelected: () => void;
  selectedCount: number;
  translate: Translate;
}) {
  return (
    <header className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">
          {translate('users.title')}
        </h1>
        <p className="mt-2 text-muted-foreground">{translate('users.subtitle')}</p>
      </div>
      <Button
        disabled={selectedCount === 0}
        onClick={onDeleteSelected}
        size="lg"
        variant="destructive"
      >
        <Trash2 />
        {translate('common.deleteSelected', { count: selectedCount })}
      </Button>
    </header>
  );
}
