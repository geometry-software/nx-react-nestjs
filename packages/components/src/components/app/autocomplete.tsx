import { Check, ChevronDown, Loader2 } from 'lucide-react';
import { useEffect, useId, useMemo, useState } from 'react';
import { Input } from '../ui/input';

export type AutocompleteOption = {
  value: string;
  label: string;
};

export function Autocomplete({
  ariaLabel,
  disabled,
  emptyText,
  invalid,
  loading,
  onSearchChange,
  onSelect,
  options,
  placeholder,
  value,
}: {
  ariaLabel: string;
  disabled?: boolean;
  emptyText: string;
  invalid?: boolean;
  loading?: boolean;
  onSearchChange?: (value: string) => void;
  onSelect: (option: AutocompleteOption) => void;
  options: AutocompleteOption[];
  placeholder?: string;
  value: string;
}) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);

  useEffect(() => setQuery(value), [value]);

  const visibleOptions = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) return options;
    return options.filter(({ label }) =>
      label.toLocaleLowerCase().includes(normalized),
    );
  }, [options, query]);

  return (
    <div
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <div className="relative">
        <Input
          aria-autocomplete="list"
          aria-controls={listId}
          aria-expanded={open}
          aria-invalid={invalid}
          aria-label={ariaLabel}
          autoComplete="off"
          className="pr-9"
          disabled={disabled}
          onChange={(event) => {
            setQuery(event.target.value);
            onSearchChange?.(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          role="combobox"
          value={query}
        />
        {loading ? (
          <Loader2 className="pointer-events-none absolute inset-y-0 right-3 my-auto size-4 animate-spin text-muted-foreground" />
        ) : (
          <ChevronDown className="pointer-events-none absolute inset-y-0 right-3 my-auto size-4 text-muted-foreground" />
        )}
      </div>
      {open && !disabled && (
        <div
          className="absolute z-60 mt-1 max-h-52 w-full overflow-auto rounded-lg border bg-popover p-1 text-popover-foreground shadow-md"
          id={listId}
          role="listbox"
        >
          {visibleOptions.length ? (
            visibleOptions.map((option) => (
              <button
                aria-selected={option.label === value}
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                key={option.value}
                onClick={() => {
                  setQuery(option.label);
                  onSelect(option);
                  setOpen(false);
                }}
                role="option"
                type="button"
              >
                <Check
                  className={`size-4 ${
                    option.label === value ? 'opacity-100' : 'opacity-0'
                  }`}
                />
                <span className="truncate">{option.label}</span>
              </button>
            ))
          ) : (
            <p className="px-2.5 py-2 text-sm text-muted-foreground">
              {emptyText}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
