import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const defaultListQuery = {
  page: '1',
  limit: '10',
  sort: 'createdAt',
  order: 'desc',
};

export type SortOrder = 'asc' | 'desc';

export function useListQueryParams() {
  const [params, setParams] = useSearchParams();
  const paramsString = params.toString();
  const query = normalizeListQuery(paramsString);
  const queryString = query.toString();
  const isReady = paramsString === queryString;

  useEffect(() => {
    if (!isReady) {
      setParams(new URLSearchParams(queryString), { replace: true });
    }
  }, [isReady, queryString, setParams]);

  const change = (key: string, value: string) => {
    const next = new URLSearchParams(query);
    value ? next.set(key, value) : next.delete(key);
    if (key !== 'page') next.set('page', defaultListQuery.page);
    setParams(normalizeListQuery(next.toString()));
  };

  const changeOrder = (order: SortOrder) => {
    if (query.get('order') !== order) change('order', order);
  };

  return {
    params,
    setParams,
    query,
    isReady,
    change,
    changeOrder,
  };
}

function normalizeListQuery(paramsString: string): URLSearchParams {
  const source = new URLSearchParams(paramsString);
  const normalized = new URLSearchParams();

  for (const [key, fallback] of Object.entries(defaultListQuery)) {
    normalized.set(key, source.get(key) ?? fallback);
  }

  [...source.entries()]
    .filter(([key]) => !(key in defaultListQuery))
    .sort(([leftKey, leftValue], [rightKey, rightValue]) =>
      leftKey === rightKey
        ? leftValue.localeCompare(rightValue)
        : leftKey.localeCompare(rightKey),
    )
    .forEach(([key, value]) => normalized.append(key, value));

  return normalized;
}
