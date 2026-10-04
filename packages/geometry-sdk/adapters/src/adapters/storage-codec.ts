import type { RepositoryRecord } from "./core/types.js";

export type RepositoryWriteContext = {
  id?: string;
  now: Date;
};

export interface RepositoryStorageCodec<
  TEntity,
  TCreate,
  TUpdate,
  TRecord extends RepositoryRecord = RepositoryRecord,
> {
  encodeCreate(value: TCreate, context: RepositoryWriteContext): TRecord;
  encodeUpdate(
    value: TUpdate,
    context: RepositoryWriteContext,
  ): Partial<TRecord>;
  decode(record: TRecord, id?: string): TEntity;
}

export function createObjectStorageCodec<
  TEntity,
  TCreate extends object,
  TUpdate extends object,
>(
  encodeDate: (date: Date) => unknown = (date) => date,
): RepositoryStorageCodec<TEntity, TCreate, TUpdate> {
  return {
    encodeCreate(value, { now }) {
      return {
        ...value,
        createdAt: encodeDate(now),
        updatedAt: encodeDate(now),
      };
    },
    encodeUpdate(value, { now }) {
      return { ...value, updatedAt: encodeDate(now) };
    },
    decode(record, id) {
      return { ...record, ...(id ? { id } : {}) } as TEntity;
    },
  };
}
