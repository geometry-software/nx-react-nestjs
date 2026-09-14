import { useEffect, useState } from 'react';

type SetSearchParams = (
  next: URLSearchParams,
  options?: { replace?: boolean },
) => void;

export function useDebouncedSearchParam(
  params: URLSearchParams,
  setParams: SetSearchParams,
  delay = 450,
) {
  const paramsString = params.toString();
  const urlSearch = params.get('search') ?? '';
  const [search, setSearch] = useState(urlSearch);

  useEffect(() => {
    setSearch(urlSearch);
  }, [urlSearch]);

  useEffect(() => {
    if (search === urlSearch) return;

    const timeout = window.setTimeout(() => {
      const next = new URLSearchParams(paramsString);
      if (search) next.set('search', search);
      else next.delete('search');
      next.set('page', '1');
      setParams(next, { replace: true });
    }, delay);

    return () => window.clearTimeout(timeout);
  }, [delay, paramsString, search, setParams, urlSearch]);

  return [search, setSearch] as const;
}
