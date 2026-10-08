import type { AutocompleteOption } from 'geometry-sdk/components';
import type { Translate } from '@/app/locales/locale';
import type { useProjectInfoFeature } from './project-info.feature';
import type { DesignSystemSampleRow } from '../models/project-info.model';

type DesignSystemFeatureAdapter = ReturnType<typeof useProjectInfoFeature>;

export interface DesignSystemFeature {
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

export class DesignSystemFeatureMapper implements DesignSystemFeature {
  public constructor(private readonly adapter: DesignSystemFeatureAdapter) {}

  public get autocompleteOptions(): AutocompleteOption[] {
    return [
      { value: 'BR', label: this.translate('designSystem.brazil') },
      { value: 'PT', label: this.translate('designSystem.portugal') },
      { value: 'ES', label: this.translate('designSystem.spain') },
      { value: 'US', label: this.translate('designSystem.unitedStates') },
    ];
  }
  public get autocompleteSelectedValue() {
    return this.adapter.autocompleteSelectedValue;
  }
  public get autocompleteValue() { return this.adapter.autocompleteValue; }
  public get componentCount() { return this.adapter.componentCount; }
  public get confirmOpen() { return this.adapter.confirmOpen; }
  public get deleteOpen() { return this.adapter.deleteOpen; }
  public get entityCategory() { return this.adapter.entityCategory; }
  public get entityOpen() { return this.adapter.entityOpen; }
  public get page() { return this.adapter.page; }
  public get rows() { return this.adapter.rows; }
  public get selectedRows() { return this.adapter.selectedRows; }
  public get sort() { return this.adapter.sort; }
  public get sortOptions(): AutocompleteOption[] {
    return [
      { value: 'createdAt', label: this.translate('products.createdDate') },
      { value: 'updatedAt', label: this.translate('products.updatedDate') },
      { value: 'name', label: this.translate('designSystem.name') },
    ];
  }
  public get translate() { return this.adapter.translate; }

  public searchAutocomplete = (value: string) =>
    this.adapter.searchAutocomplete(value);
  public selectAutocomplete = (value: string, label: string) =>
    this.adapter.selectAutocomplete(value, label);
  public setConfirmOpen = (open: boolean) => this.adapter.setConfirmOpen(open);
  public setDeleteOpen = (open: boolean) => this.adapter.setDeleteOpen(open);
  public setEntityCategory = (category: string) =>
    this.adapter.setEntityCategory(category);
  public setEntityOpen = (open: boolean) => this.adapter.setEntityOpen(open);
  public setPage = (page: number) => this.adapter.setPage(page);
  public setSelectedRows = (rows: Set<string>) =>
    this.adapter.setSelectedRows(rows);
  public setSort = (value: string) => this.adapter.setSort(value);
}
