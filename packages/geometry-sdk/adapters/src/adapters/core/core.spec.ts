import { describe, expect, expectTypeOf, it } from "vitest";
import type { Codec } from "./codec.js";
import {
  RepositoryConflictError,
  RepositoryConnectionError,
  RepositoryError,
  RepositoryNotFoundError,
  RepositoryValidationError,
} from "./errors.js";
import { isValidPageQuery, RepositoryQuery } from "./query.js";
import type {
  CrudRepositoryPort,
  RepositoryReadPort,
} from "./repository.js";

type ApplicationState = {
  locale: string;
  flags: Record<string, boolean>;
};

type StateQuery = { namespace: string };

describe("repository core", () => {
  it("supports arbitrary application data and custom query/id types", () => {
    const repository: CrudRepositoryPort<
      ApplicationState,
      ApplicationState,
      Partial<ApplicationState>,
      number
    > = {
      async findAll() {
        return [{ locale: "en", flags: {} }];
      },
      async findOne() {
        return { locale: "en", flags: {} };
      },
      async create(value) {
        return value;
      },
      async update(_id, value) {
        return { locale: value.locale ?? "en", flags: value.flags ?? {} };
      },
      async remove() {
        return { deleted: true };
      },
      async removeMany(ids) {
        return { deleted: ids.length };
      },
    };

    expectTypeOf(repository).toMatchTypeOf<
      RepositoryReadPort<ApplicationState, number>
    >();
    expectTypeOf<StateQuery>().toEqualTypeOf<{ namespace: string }>();
    expect(repository).toBeDefined();
  });

  it("provides a small typed query object with defaults", () => {
    expect(new RepositoryQuery({ search: "term", order: "asc" })).toEqual({
      page: 1,
      limit: 10,
      search: "term",
      sort: "createdAt",
      order: "asc",
    });
  });

  it("validates page-based pagination independently of adapters", () => {
    expect(isValidPageQuery({ page: 1, limit: 10 })).toBe(true);
    expect(isValidPageQuery({ page: 0, limit: 10 })).toBe(false);
    expect(isValidPageQuery({ page: 1, limit: 1.5 })).toBe(false);
  });

  it("supports an optional codec without repository coupling", () => {
    const codec: Codec<ApplicationState, string> = {
      encode: JSON.stringify,
      decode: JSON.parse,
    };
    const state = { locale: "en", flags: { compact: true } };

    expect(codec.decode(codec.encode(state))).toEqual(state);
  });

  it.each([
    [new RepositoryError("failed"), "REPOSITORY_ERROR"],
    [new RepositoryNotFoundError("Entry", 7), "REPOSITORY_NOT_FOUND"],
    [new RepositoryValidationError("invalid"), "REPOSITORY_VALIDATION"],
    [new RepositoryConflictError("duplicate"), "REPOSITORY_CONFLICT"],
    [new RepositoryConnectionError(), "REPOSITORY_CONNECTION"],
  ])("exposes framework-independent errors", (error, code) => {
    expect(error).toBeInstanceOf(Error);
    expect(error.code).toBe(code);
    expect(error.name).toBe(error.constructor.name);
  });
});
