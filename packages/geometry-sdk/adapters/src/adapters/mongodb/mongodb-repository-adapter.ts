import { ObjectId } from "mongodb";
import type { DeepPartial, MongoRepository, ObjectLiteral } from "typeorm";
import {
  RepositoryConflictError,
  RepositoryConnectionError,
  RepositoryNotFoundError,
  RepositoryValidationError,
} from "../core/errors.js";
import { isValidPageQuery } from "../core/query.js";
import type { CollectionApiAdapterOptions } from "../core/repository.js";
import type { PaginatedResult, RepositoryOptions } from "../core/types.js";
import type {
  MongoDbRepositoryAdapterPort,
  MongoDbRepositoryQuery,
} from "./types.js";

export type MongoAdapterConfiguration<
  TData extends ObjectLiteral,
  TCreate,
  TUpdate,
> = CollectionApiAdapterOptions & {
  repository: MongoRepository<TData>;
  options: RepositoryOptions<TData>;
  create: (value: TCreate) => DeepPartial<TData>;
  update?: (value: TUpdate) => DeepPartial<TData>;
};

export type MongoAdapterOptions<
  TData extends ObjectLiteral,
  TCreate,
  TUpdate,
> = MongoAdapterConfiguration<TData, TCreate, TUpdate>;

export function createMongoAdapter<
  TData extends ObjectLiteral,
  TCreate,
  TUpdate,
>(
  config: MongoAdapterConfiguration<TData, TCreate, TUpdate>,
): MongoDbRepositoryAdapterPort<TData, TCreate, TUpdate> {
  const findOne = async (id: string): Promise<TData> => {
    const entity = ObjectId.isValid(id)
      ? await runMongo("findOne", () =>
          config.repository.findOneBy({ id: new ObjectId(id) } as never),
        )
      : null;
    if (!entity) {
      throw new RepositoryNotFoundError(config.options.entityName, id);
    }
    return entity;
  };

  async function findAll(): Promise<TData[]>;
  async function findAll(
    query: MongoDbRepositoryQuery<TData>,
  ): Promise<PaginatedResult<TData>>;
  async function findAll(
    query?: MongoDbRepositoryQuery<TData>,
  ): Promise<TData[] | PaginatedResult<TData>> {
    if (query === undefined) {
      return runMongo("findAll", () =>
        config.repository.createEntityCursor({}).toArray(),
      );
    }
    if (!isValidPageQuery(query)) {
      throw new RepositoryValidationError(
        "MongoDB pagination requires positive integer page and limit values",
      );
    }
    const search = query.search?.trim();
    const searchFilter = search
      ? {
          $or: config.options.searchableFields.map((field) => ({
            [field]: { $regex: escapeRegex(search), $options: "i" },
          })),
        }
      : {};
    const filter = query.filter
      ? search
        ? { $and: [query.filter, searchFilter] }
        : query.filter
      : searchFilter;
    const requestedSort = config.options.sortableFields.includes(
      query.sort as Extract<keyof TData, string>,
    )
      ? query.sort
      : (config.options.defaultSort ?? "createdAt");
    const sort =
      config.options.sortFieldMap?.[requestedSort] ?? requestedSort;
    const [data, total] = await runMongo("findAll", () =>
      Promise.all([
        config.repository
          .createEntityCursor(filter as never)
          .sort(sort, query.order === "asc" ? 1 : -1)
          .skip((query.page - 1) * query.limit)
          .limit(query.limit)
          .toArray(),
        config.repository.countDocuments(filter as never),
      ]),
    );
    return {
      data,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.limit)),
      },
    };
  }

  return {
    source: config.source,
    findAll,

    async create(value) {
      return runMongo("create", () =>
        config.repository.save(config.repository.create(config.create(value))),
      );
    },

    findOne,

    async update(id, value) {
      const entity = await findOne(id);
      const patch = config.update
        ? config.update(value)
        : (value as DeepPartial<TData>);
      return runMongo("update", () =>
        config.repository.save(
          Object.assign(entity, patch, { updatedAt: new Date() }),
        ),
      );
    },

    async remove(id) {
      const entity = await findOne(id);
      await runMongo("remove", () => config.repository.remove(entity));
      return { deleted: true };
    },

    async removeMany(ids) {
      const uniqueIds = [...new Set(ids)];
      const invalidId = uniqueIds.find((id) => !ObjectId.isValid(id));
      if (invalidId) {
        throw new RepositoryValidationError(`Invalid entity id: ${invalidId}`);
      }
      const result = await runMongo("removeMany", () =>
        config.repository.deleteMany({
          _id: { $in: uniqueIds.map((id) => new ObjectId(id)) },
        }),
      );
      return { deleted: result.deletedCount };
    },
  };
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function runMongo<TResult>(
  operation: string,
  run: () => Promise<TResult>,
): Promise<TResult> {
  try {
    return await run();
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new RepositoryConflictError(
        "MongoDB document already exists",
        error,
      );
    }
    throw new RepositoryConnectionError(`MongoDB ${operation} failed`, error);
  }
}

function isDuplicateKeyError(error: unknown): error is { code: 11000 } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  );
}
