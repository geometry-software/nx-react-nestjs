import type { AutocompleteOption } from 'geometry-sdk/components';
import type { Translate } from '@/app/locales/locale';
import type { useProjectInfoFeature } from '../feature/project-info.feature';
import type { DesignSystemSampleRow } from './project-info.model';

type DesignSystemFeature = ReturnType<typeof useProjectInfoFeature>;

export interface DesignSystemPageModel {
  readonly autocompleteOptions: AutocompleteOption[];
  readonly autocompleteSelectedValue: string;
  readonly autocompleteValue: string;
  readonly componentCount: number;
  readonly confirmOpen: boolean;
  readonly deleteOpen: boolean;
  readonly entityCategory: string;
  readonly entityOpen: boolean;
  readonly page: number;
  readonly rows: DesignSystemSampleRow[];
  readonly selectedRows: Set<string>;
  readonly sort: string;
  readonly sortOptions: AutocompleteOption[];
  readonly translate: Translate;

  searchAutocomplete(value: string): void;
  selectAutocomplete(value: string, label: string): void;
  setConfirmOpen(open: boolean): void;
  setDeleteOpen(open: boolean): void;
  setEntityCategory(category: string): void;
  setEntityOpen(open: boolean): void;
  setPage(page: number): void;
  setSelectedRows(rows: Set<string>): void;
  setSort(value: string): void;
}

export class DesignSystemPageModelInstance implements DesignSystemPageModel {
  public constructor(private readonly feature: DesignSystemFeature) {}

  public get autocompleteOptions(): AutocompleteOption[] {
    return [
      { value: 'BR', label: this.translate('designSystem.brazil') },
      { value: 'PT', label: this.translate('designSystem.portugal') },
      { value: 'ES', label: this.translate('designSystem.spain') },
      { value: 'US', label: this.translate('designSystem.unitedStates') },
    ];
  }
  public get autocompleteSelectedValue() {
    return this.feature.autocompleteSelectedValue;
  }
  public get autocompleteValue() { return this.feature.autocompleteValue; }
  public get componentCount() { return this.feature.componentCount; }
  public get confirmOpen() { return this.feature.confirmOpen; }
  public get deleteOpen() { return this.feature.deleteOpen; }
  public get entityCategory() { return this.feature.entityCategory; }
  public get entityOpen() { return this.feature.entityOpen; }
  public get page() { return this.feature.page; }
  public get rows() { return this.feature.rows; }
  public get selectedRows() { return this.feature.selectedRows; }
  public get sort() { return this.feature.sort; }
  public get sortOptions(): AutocompleteOption[] {
    return [
      { value: 'createdAt', label: this.translate('products.createdDate') },
      { value: 'updatedAt', label: this.translate('products.updatedDate') },
      { value: 'name', label: this.translate('designSystem.name') },
    ];
  }
  public get translate() { return this.feature.translate; }

  public searchAutocomplete = (value: string) =>
    this.feature.searchAutocomplete(value);
  public selectAutocomplete = (value: string, label: string) =>
    this.feature.selectAutocomplete(value, label);
  public setConfirmOpen = (open: boolean) => this.feature.setConfirmOpen(open);
  public setDeleteOpen = (open: boolean) => this.feature.setDeleteOpen(open);
  public setEntityCategory = (category: string) =>
    this.feature.setEntityCategory(category);
  public setEntityOpen = (open: boolean) => this.feature.setEntityOpen(open);
  public setPage = (page: number) => this.feature.setPage(page);
  public setSelectedRows = (rows: Set<string>) =>
    this.feature.setSelectedRows(rows);
  public setSort = (value: string) => this.feature.setSort(value);
}
