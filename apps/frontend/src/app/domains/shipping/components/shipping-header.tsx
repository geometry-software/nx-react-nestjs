import { Trash2, Truck } from 'lucide-react';
import { Button } from 'geometry-sdk/components';
import type { Translate } from '@/app/locales/locale';

export function ShippingHeader({
  onAdd,
  onDeleteSelected,
  selectedCount,
  translate,
}: {
  onAdd: () => void;
  onDeleteSelected: () => void;
  selectedCount: number;
  translate: Translate;
}) {
  return (
    <header className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">
          {translate('shipping.title')}
        </h1>
        <p className="mt-2 text-muted-foreground">{translate('shipping.subtitle')}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          disabled={!selectedCount}
          onClick={onDeleteSelected}
          size="lg"
          variant="destructive"
        >
          <Trash2 />
          {translate('common.deleteSelected', { count: selectedCount })}
        </Button>
        <Button onClick={onAdd} size="lg">
          <Truck />
          {translate('shipping.add')}
        </Button>
      </div>
    </header>
  );
}
