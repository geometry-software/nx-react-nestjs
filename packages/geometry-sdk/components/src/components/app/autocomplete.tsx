import { Check, ChevronDown, Loader2 } from 'lucide-react';
import { Popover as PopoverPrimitive } from 'radix-ui';
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
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
  selectedValue,
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
  selectedValue?: string;
  value: string;
}) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const [activeIndex, setActiveIndex] = useState(-1);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => setQuery(value), [value]);

  const visibleOptions = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) return options;
    return options.filter(({ label }) =>
      label.toLocaleLowerCase().includes(normalized),
    );
  }, [options, query]);

  useEffect(() => {
    setActiveIndex((current) =>
      visibleOptions.length === 0
        ? -1
        : Math.min(Math.max(current, 0), visibleOptions.length - 1),
    );
  }, [visibleOptions]);

  useEffect(() => {
    if (open && activeIndex >= 0) {
      optionRefs.current[activeIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex, open]);

  const selectOption = (option: AutocompleteOption) => {
    setQuery(option.label);
    onSelect(option);
    setOpen(false);
    setActiveIndex(-1);
  };

  return (
    <PopoverPrimitive.Root
      open={open && !disabled}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) setActiveIndex(-1);
      }}
    >
      <PopoverPrimitive.Anchor asChild>
        <div className="relative">
          <Input
            aria-activedescendant={
              open && activeIndex >= 0
                ? `${listId}-option-${activeIndex}`
                : undefined
            }
            aria-autocomplete="list"
            aria-busy={loading || undefined}
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
              setActiveIndex(0);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown') {
                event.preventDefault();
                setOpen(true);
                setActiveIndex((current) =>
                  Math.min(current + 1, visibleOptions.length - 1),
                );
              } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                setOpen(true);
                setActiveIndex((current) =>
                  current <= 0 ? visibleOptions.length - 1 : current - 1,
                );
              } else if (
                event.key === 'Enter' &&
                open &&
                activeIndex >= 0 &&
                visibleOptions[activeIndex]
              ) {
                event.preventDefault();
                selectOption(visibleOptions[activeIndex]);
              } else if (event.key === 'Escape') {
                setOpen(false);
              }
            }}
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
      </PopoverPrimitive.Anchor>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          className="z-60 max-h-52 w-[var(--radix-popover-trigger-width)] overflow-auto rounded-lg border bg-popover p-1 text-popover-foreground shadow-md"
          onOpenAutoFocus={(event) => event.preventDefault()}
          sideOffset={4}
        >
          <div id={listId} role="listbox">
            {visibleOptions.length ? (
              visibleOptions.map((option, index) => (
                <button
                  aria-selected={option.value === selectedValue}
                  className={`flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground ${
                    index === activeIndex
                      ? 'bg-accent text-accent-foreground'
                      : ''
                  }`}
                  id={`${listId}-option-${index}`}
                  key={option.value}
                  onClick={() => selectOption(option)}
                  onMouseEnter={() => setActiveIndex(index)}
                  ref={(element) => {
                    optionRefs.current[index] = element;
                  }}
                  role="option"
                  tabIndex={-1}
                  type="button"
                >
                  <Check
                    className={`size-4 ${
                      option.value === selectedValue
                        ? 'opacity-100'
                        : 'opacity-0'
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
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
