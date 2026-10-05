import { ArrowDown, ArrowUp, Search } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { FilterSelect, type SelectOption } from './filter-select';
import { FormField, FormInput } from './form-field';
import type { SortOrder } from '../hooks/use-list-query-params';

export type FilterField =
  | {
      kind: 'select';
      key: string;
      label: string;
      ariaLabel: string;
      value: string;
      options: SelectOption[];
      onChange: (value: string) => void;
      className?: string;
    }
  | {
      kind: 'order';
      key: string;
      label: string;
      ariaLabel?: string;
      value: SortOrder;
      ascendingLabel: string;
      descendingLabel: string;
      onChange: (value: SortOrder) => void;
    };

export type FilterProps = {
  search: {
    label: string;
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
    inputId?: string;
  };
  fields: FilterField[];
};

export function Filter({ search, fields }: FilterProps) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <FormInput
          className="w-full lg:w-80"
          inputId={search.inputId}
          label={search.label}
          onChange={(event) => search.onChange(event.target.value)}
          placeholder={search.placeholder}
          startAdornment={<Search aria-hidden="true" className="size-3.5" />}
          value={search.value}
        />
        <div className="flex flex-wrap items-end gap-3">
          {fields.map((field) => (
            <FormField key={field.key} label={field.label}>
              {field.kind === 'select' ? (
                <FilterSelect
                  ariaLabel={field.ariaLabel}
                  className={field.className}
                  onChange={field.onChange}
                  options={field.options}
                  value={field.value}
                />
              ) : (
                <div
                  aria-label={field.ariaLabel}
                  className="flex h-8 items-center gap-1 rounded-lg border px-[5.5px] py-px"
                >
                  <Button
                    className="px-3 font-normal"
                    onClick={() => field.onChange('desc')}
                    size="xs"
                    variant={field.value === 'desc' ? 'default' : 'ghost'}
                  >
                    {field.descendingLabel}
                    <ArrowDown aria-hidden="true" className="size-3" strokeWidth={2} />
                  </Button>
                  <Button
                    className="px-3 font-normal"
                    onClick={() => field.onChange('asc')}
                    size="xs"
                    variant={field.value === 'asc' ? 'default' : 'ghost'}
                  >
                    {field.ascendingLabel}
                    <ArrowUp aria-hidden="true" className="size-3" strokeWidth={2} />
                  </Button>
                </div>
              )}
            </FormField>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
