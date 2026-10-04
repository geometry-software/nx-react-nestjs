import { ObjectId } from "mongodb";
import type { MongoRepository } from "typeorm";
import { createMemoryAdapter } from "geometry-sdk/adapters";
import { createMongoAdapter } from "geometry-sdk/adapters";
import {
  repositoryConformanceSuite,
  type ConformanceItem,
  type CreateConformanceItem,
  type UpdateConformanceItem,
} from "./repository-conformance.js";

const options = {
  entityName: "Item",
  searchableFields: ["name"],
  sortableFields: ["name", "quantity", "createdAt"],
  defaultSort: "createdAt",
} as const;

repositoryConformanceSuite("Memory", () =>
  createMemoryAdapter<
    ConformanceItem,
    CreateConformanceItem,
    UpdateConformanceItem
  >({
    options,
    getId: (value) => value.id,
    createId: () => new ObjectId().toHexString(),
    create: (value, { id, now }) => ({
      ...value,
      id,
      createdAt: now,
      updatedAt: now,
    }),
    update: (current, value, now) => ({
      ...current,
      ...value,
      updatedAt: now,
    }),
  }),
  { paginated: false },
);

repositoryConformanceSuite("MongoDB", () =>
  createMongoAdapter<
    ConformanceItem,
    CreateConformanceItem,
    UpdateConformanceItem
  >({
    options,
    repository: createMongoRepositoryDouble(),
    create: (value) => value,
  }),
);

function createMongoRepositoryDouble(): MongoRepository<ConformanceItem> {
  const values = new Map<string, ConformanceItem>();
  let filter: Record<string, unknown> = {};
  let sortField = "createdAt";
  let direction = -1;
  let offset = 0;
  let pageSize = 10;
  const cursor = {
    sort(field: string, value: number) {
      sortField = field;
      direction = value;
      return this;
    },
    skip(value: number) {
      offset = value;
      return this;
    },
    limit(value: number) {
      pageSize = value;
      return this;
    },
    async toArray() {
      return matchingValues(values, filter)
        .sort(
          (left, right) =>
            compare(
              (left as unknown as Record<string, unknown>)[sortField],
              (right as unknown as Record<string, unknown>)[sortField],
            ) * direction,
        )
        .slice(offset, offset + pageSize);
    },
  };
  const repository = {
    createEntityCursor(value: Record<string, unknown>) {
      filter = value;
      return cursor;
    },
    async countDocuments(value: Record<string, unknown>) {
      return matchingValues(values, value).length;
    },
    create(value: CreateConformanceItem) {
      const now = new Date();
      return {
        ...value,
        id: new ObjectId().toHexString(),
        createdAt: now,
        updatedAt: now,
      };
    },
    async save(value: ConformanceItem) {
      values.set(String(value.id), value);
      return value;
    },
    async findOneBy(value: { id: ObjectId }) {
      return values.get(value.id.toHexString()) ?? null;
    },
    async remove(value: ConformanceItem) {
      values.delete(String(value.id));
      return value;
    },
    async deleteMany(value: { _id: { $in: ObjectId[] } }) {
      let deletedCount = 0;
      for (const id of value._id.$in) {
        deletedCount += values.delete(id.toHexString()) ? 1 : 0;
      }
      return { deletedCount };
    },
  };
  return repository as unknown as MongoRepository<ConformanceItem>;
}

function matchingValues(
  values: Map<string, ConformanceItem>,
  filter: Record<string, unknown>,
): ConformanceItem[] {
  const alternatives = filter.$or as
    Record<string, { $regex: string; $options: string }>[] | undefined;
  return [...values.values()].filter(
    (value) =>
      !alternatives ||
      alternatives.some((alternative) => {
        const [field, condition] = Object.entries(alternative)[0];
        return new RegExp(condition.$regex, condition.$options).test(
          String((value as unknown as Record<string, unknown>)[field]),
        );
      }),
  );
}

function compare(left: unknown, right: unknown): number {
  const leftValue = comparableValue(left);
  const rightValue = comparableValue(right);
  if (leftValue === rightValue) return 0;
  return leftValue < rightValue ? -1 : 1;
}

function comparableValue(value: unknown): string | number {
  if (value instanceof Date) return value.getTime();
  return typeof value === "number" ? value : String(value);
}
