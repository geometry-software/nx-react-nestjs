import { describe, expect, it } from 'vitest';
import type { Page, Product } from '../lib/types';
import {
  prependToFirstPage,
  removeFromPage,
  replaceInPage,
} from './cache-updates';

const product = (id: string): Product => ({
  id,
  name: id,
  price: 10,
  description: '',
  active: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
});

const page = (data: Product[], total = data.length): Page<Product> => ({
  data,
  meta: { page: 1, limit: 2, total, totalPages: Math.max(1, Math.ceil(total / 2)) },
});

describe('pagination cache updates', () => {
  it('prepends a created entity and keeps the page size bounded', () => {
    const current = page([product('old-1'), product('old-2')]);

    prependToFirstPage(current as never, product('new'));

    expect(current.data.map(({ id }) => id)).toEqual(['new', 'old-1']);
    expect(current.meta).toMatchObject({ total: 3, totalPages: 2 });
  });

  it('replaces an updated entity in the current page', () => {
    const current = page([product('one'), product('two')]);
    const updated = { ...product('two'), price: 99 };

    replaceInPage(current as never, updated);

    expect(current.data[1]).toEqual(updated);
  });

  it('removes an entity and recalculates pagination metadata', () => {
    const current = page([product('one'), product('two')], 3);

    removeFromPage(current as never, 'one');

    expect(current.data.map(({ id }) => id)).toEqual(['two']);
    expect(current.meta).toMatchObject({ total: 2, totalPages: 1 });
  });

  it('does not change metadata when the entity is not in the current page', () => {
    const current = page([product('one'), product('two')], 3);

    removeFromPage(current as never, 'not-on-this-page');

    expect(current.data).toHaveLength(2);
    expect(current.meta).toMatchObject({ total: 3, totalPages: 2 });
  });

  it('removes multiple entities with the single-delete cache update', () => {
    const current = page([product('one'), product('two')], 5);

    ['one', 'two'].forEach((id) => removeFromPage(current as never, id));

    expect(current.data).toEqual([]);
    expect(current.meta).toMatchObject({ total: 3, totalPages: 2 });
  });
});
