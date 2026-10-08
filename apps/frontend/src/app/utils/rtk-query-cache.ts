import type { Draft } from '@reduxjs/toolkit';
import type { Page } from '@/app/models/api.model';

type Entity = { id: string };

export function addEntityToFirstPage<T extends Entity>(
  draft: Draft<Page<T>>,
  entity: T,
): void {
  if (draft.meta.page === 1) {
    draft.data.unshift(entity as Draft<T>);
    draft.data.splice(draft.meta.limit);
  }
  draft.meta.total += 1;
}

export function replaceEntityInPage<T extends Entity>(
  draft: Draft<Page<T>>,
  entity: T,
): void {
  const index = draft.data.findIndex((item) => item.id === entity.id);
  if (index >= 0) draft.data[index] = entity as Draft<T>;
}

export function removeEntityFromPage<T extends Entity>(
  draft: Draft<Page<T>>,
  id: string,
): void {
  const index = draft.data.findIndex((item) => item.id === id);
  if (index < 0) return;
  draft.data.splice(index, 1);
  draft.meta.total = Math.max(0, draft.meta.total - 1);
}
