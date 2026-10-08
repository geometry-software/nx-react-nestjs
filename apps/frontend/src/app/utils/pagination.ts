import type { PageMeta } from '@/app/models/api.model';

export function getPageCount(meta?: Pick<PageMeta, 'total' | 'limit'>): number {
  if (!meta || meta.limit < 1) return 1;
  return Math.max(1, Math.ceil(meta.total / meta.limit));
}
