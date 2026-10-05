import { FileDown, PlusCircle, Trash2 } from 'lucide-react';
import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from 'geometry-sdk/components';
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
  const noSelection = selectedCount === 0;

  return (
    <header className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">
          {translate('products.title')}
        </h1>
        <p className="mt-2 text-muted-foreground">{translate('products.subtitle')}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex cursor-not-allowed" tabIndex={noSelection ? 0 : undefined}>
              <Button
                className={noSelection ? 'pointer-events-none' : undefined}
                disabled={noSelection}
                onClick={onDeleteSelected}
                size="lg"
                variant="destructive"
              >
                <Trash2 />
                {translate('common.deleteSelected', { count: selectedCount })}
              </Button>
            </span>
          </TooltipTrigger>
          {noSelection && (
            <TooltipContent>{translate('common.selectRecordsFirst')}</TooltipContent>
          )}
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex cursor-not-allowed" tabIndex={noSelection ? 0 : undefined}>
              <Button
                className={noSelection ? 'pointer-events-none' : undefined}
                disabled={noSelection}
                onClick={onCreateInvoice}
                size="lg"
                variant="outline"
              >
                <FileDown />
                {translate('common.reportSelected', { count: selectedCount })}
              </Button>
            </span>
          </TooltipTrigger>
          {noSelection && (
            <TooltipContent>{translate('common.selectRecordsFirst')}</TooltipContent>
          )}
        </Tooltip>
        <Button onClick={onAdd} size="lg">
          <PlusCircle />
          {translate('products.add')}
        </Button>
      </div>
    </header>
  );
}
