import { Badge, type AutocompleteOption } from 'geometry-sdk/components';
import type { Translate } from '@/app/locales/locale';
import type { DesignSystemSampleRow } from '../models/project-info.model';
import { DesignSystemDialogs } from './design-system-dialogs';
import { DesignSystemFormControls } from './design-system-form-controls';
import { DesignSystemTable } from './design-system-table';
import { ProjectInfoHeader } from './project-info-header';

type DesignSystemViewProps = {
  autocompleteOptions: AutocompleteOption[];
  autocompleteSelectedValue: string;
  autocompleteValue: string;
  componentCount: number;
  confirmOpen: boolean;
  deleteOpen: boolean;
  entityCategory: string;
  entityOpen: boolean;
  onAutocompleteSearch: (value: string) => void;
  onAutocompleteSelect: (value: string, label: string) => void;
  onConfirmOpenChange: (open: boolean) => void;
  onDeleteOpenChange: (open: boolean) => void;
  onEntityCategoryChange: (category: string) => void;
  onEntityOpenChange: (open: boolean) => void;
  onPageChange: (page: number) => void;
  onSelectedRowsChange: (rows: Set<string>) => void;
  onSortChange: (value: string) => void;
  page: number;
  rows: DesignSystemSampleRow[];
  selectedRows: Set<string>;
  sort: string;
  sortOptions: AutocompleteOption[];
  translate: Translate;
};

export function DesignSystemView(props: DesignSystemViewProps) {
  const { componentCount, translate } = props;

  return (
    <div className="space-y-8">
      <ProjectInfoHeader
        eyebrow={translate('designSystem.eyebrow')}
        title={translate('designSystem.title')}
        description={translate('designSystem.subtitle')}
        action={
          <Badge className="h-8 px-3 text-sm" variant="outline">
            {translate('designSystem.componentsCount', { count: componentCount })}
          </Badge>
        }
      />
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold">
            {translate('designSystem.appGroup')}
          </h2>
          <p className="text-muted-foreground">
            {translate('designSystem.appGroupText')}
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <DesignSystemFormControls
            autocompleteOptions={props.autocompleteOptions}
            autocompleteSelectedValue={props.autocompleteSelectedValue}
            autocompleteValue={props.autocompleteValue}
            onAutocompleteSearch={props.onAutocompleteSearch}
            onAutocompleteSelect={props.onAutocompleteSelect}
            onSortChange={props.onSortChange}
            sort={props.sort}
            sortOptions={props.sortOptions}
            translate={translate}
          />
          <DesignSystemTable
            onPageChange={props.onPageChange}
            onSelectedRowsChange={props.onSelectedRowsChange}
            page={props.page}
            rows={props.rows}
            selectedRows={props.selectedRows}
            translate={translate}
          />
          <DesignSystemDialogs
            confirmOpen={props.confirmOpen}
            deleteOpen={props.deleteOpen}
            entityCategory={props.entityCategory}
            entityOpen={props.entityOpen}
            onConfirmOpenChange={props.onConfirmOpenChange}
            onDeleteOpenChange={props.onDeleteOpenChange}
            onEntityCategoryChange={props.onEntityCategoryChange}
            onEntityOpenChange={props.onEntityOpenChange}
            translate={translate}
          />
        </div>
      </section>
    </div>
  );
}
