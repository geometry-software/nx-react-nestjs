import { Plus, Trash2 } from 'lucide-react';
import {
  Autocomplete,
  type AutocompleteOption,
  Button,
  FilterSelect,
  Input,
  Label,
} from 'geometry-sdk/components';
import type { Translate } from '@/app/locales/locale';
import { DesignSystemShowcase } from './design-system-showcase';

export function DesignSystemFormControls({
  autocompleteOptions,
  autocompleteSelectedValue,
  autocompleteValue,
  onAutocompleteSearch,
  onAutocompleteSelect,
  onSortChange,
  sort,
  sortOptions,
  translate,
}: {
  autocompleteOptions: AutocompleteOption[];
  autocompleteSelectedValue: string;
  autocompleteValue: string;
  onAutocompleteSearch: (value: string) => void;
  onAutocompleteSelect: (value: string, label: string) => void;
  onSortChange: (value: string) => void;
  sort: string;
  sortOptions: AutocompleteOption[];
  translate: Translate;
}) {
  return (
    <>
      <DesignSystemShowcase
        badgeLabel={translate('designSystem.reactComponent')}
        name="Button"
        description={translate('designSystem.description.button')}
      >
        <Button><Plus /> {translate('designSystem.primary')}</Button>
        <Button variant="outline">{translate('designSystem.outline')}</Button>
        <Button variant="secondary">{translate('designSystem.secondary')}</Button>
        <Button variant="destructive">
          <Trash2 /> {translate('designSystem.destructive')}
        </Button>
        <Button loading loadingLabel={translate('designSystem.loading')}>
          {translate('designSystem.loading')}
        </Button>
      </DesignSystemShowcase>
      <DesignSystemShowcase
        badgeLabel={translate('designSystem.reactComponent')}
        name="Input"
        description={translate('designSystem.description.input')}
      >
        <div className="grid w-full max-w-sm gap-2">
          <Label htmlFor="design-system-input">{translate('products.productName')}</Label>
          <Input
            id="design-system-input"
            placeholder={translate('designSystem.enterValue')}
          />
        </div>
        <div className="grid w-full max-w-sm gap-2">
          <Label htmlFor="design-system-invalid">
            {translate('designSystem.invalidField')}
          </Label>
          <Input
            aria-invalid="true"
            defaultValue={translate('designSystem.incorrectValue')}
            id="design-system-invalid"
          />
        </div>
      </DesignSystemShowcase>
      <DesignSystemShowcase
        badgeLabel={translate('designSystem.reactComponent')}
        className="relative z-20 overflow-visible"
        name="Autocomplete"
        description={translate('designSystem.description.autocomplete')}
      >
        <div className="grid w-full max-w-sm gap-2">
          <Label>{translate('designSystem.country')}</Label>
          <Autocomplete
            ariaLabel={translate('designSystem.country')}
            emptyText={translate('designSystem.noCountries')}
            onSearchChange={onAutocompleteSearch}
            onSelect={(option) => onAutocompleteSelect(option.value, option.label)}
            options={autocompleteOptions}
            placeholder={translate('designSystem.searchCountry')}
            selectedValue={autocompleteSelectedValue}
            value={autocompleteValue}
          />
        </div>
      </DesignSystemShowcase>
      <DesignSystemShowcase
        badgeLabel={translate('designSystem.reactComponent')}
        name="FilterSelect"
        description={translate('designSystem.description.filterSelect')}
      >
        <div className="grid gap-2">
          <Label>{translate('designSystem.sortField')}</Label>
          <FilterSelect
            ariaLabel={translate('designSystem.sortField')}
            onChange={onSortChange}
            options={sortOptions}
            value={sort}
          />
        </div>
      </DesignSystemShowcase>
    </>
  );
}
