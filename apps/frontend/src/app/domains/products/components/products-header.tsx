import { FileDown, PlusCircle, Trash2 } from 'lucide-react';
import { Button } from 'geometry-sdk/components';
import type { Translate } from '@/app/locales/locale';

export function ProductsHeader({
  onAdd,
  onCreateInvoice,
  onDeleteSelected,
  selectedCount,
  translate,
}: {
  onAdd: () => void;
  onCreateInvoice: () => void;
  onDeleteSelected: () => void;
  selectedCount: number;
  translate: Translate;
}) {
  return (
    <header className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">
          {translate('products.title')}
        </h1>
        <p className="mt-2 text-muted-foreground">{translate('products.subtitle')}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          disabled={selectedCount === 0}
          onClick={onDeleteSelected}
          size="lg"
          variant="destructive"
        >
          <Trash2 />
          {translate('common.deleteSelected', { count: selectedCount })}
        </Button>
        <Button
          disabled={selectedCount === 0}
          onClick={onCreateInvoice}
          size="lg"
          variant="outline"
        >
          <FileDown />
          {translate('common.reportSelected', { count: selectedCount })}
        </Button>
        <Button onClick={onAdd} size="lg">
          <PlusCircle />
          {translate('products.add')}
        </Button>
      </div>
    </header>
  );
}
