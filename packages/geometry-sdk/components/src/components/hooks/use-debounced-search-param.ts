import { useEffect, useState } from 'react';
import { useDebouncedValue } from './use-debounced-value.js';

type SetSearchParams = (
  next: URLSearchParams,
  options?: { replace?: boolean },
) => void;

const DEFAULT_DEBOUNCE_DELAY_MS = 450;

export function useDebouncedSearchParam(
  params: URLSearchParams,
  setParams: SetSearchParams,
  delay = DEFAULT_DEBOUNCE_DELAY_MS,
) {
  const paramsString = params.toString();
  const urlSearch = params.get('search') ?? '';
  const [search, setSearch] = useState(urlSearch);
  const debouncedSearch = useDebouncedValue(search, delay);

  useEffect(() => {
    setSearch(urlSearch);
  }, [urlSearch]);

  useEffect(() => {
    if (debouncedSearch === urlSearch) return;

    const next = new URLSearchParams(paramsString);
    if (debouncedSearch) next.set('search', debouncedSearch);
    else next.delete('search');
    next.set('page', '1');
    setParams(next, { replace: true });
  }, [debouncedSearch, paramsString, setParams, urlSearch]);

  return [search, setSearch] as const;
}
