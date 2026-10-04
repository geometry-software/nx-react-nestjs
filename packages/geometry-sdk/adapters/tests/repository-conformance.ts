import { beforeEach, describe, expect, it } from "vitest";
import {
  RepositoryNotFoundError,
  RepositoryQuery,
  type CrudRepositoryPort,
  type PaginatedResult,
} from "geometry-sdk/adapters";

export type ConformanceItem = {
  id: string;
  name: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateConformanceItem = Pick<ConformanceItem, "name" | "quantity">;
export type UpdateConformanceItem = Partial<CreateConformanceItem>;
export type ConformanceRepository = CrudRepositoryPort<
  ConformanceItem,
  CreateConformanceItem,
  UpdateConformanceItem
> & {
  findAll(
    query: RepositoryQuery,
  ): Promise<PaginatedResult<ConformanceItem> | ConformanceItem[]>;
};

export function repositoryConformanceSuite(
  name: string,
  createRepository: () =>
    ConformanceRepository | Promise<ConformanceRepository>,
  options: { paginated?: boolean } = {},
): void {
  describe(`${name} repository conformance`, () => {
    let repository: ConformanceRepository;

    beforeEach(async () => {
      repository = await createRepository();
    });

    it("creates and finds a value by id", async () => {
      const created = await repository.create({ name: "Alpha", quantity: 1 });

      await expect(repository.findOne(created.id)).resolves.toEqual(created);
    });

    it("filters and orders lists with adapter pagination semantics", async () => {
      await repository.create({ name: "Beta", quantity: 2 });
      await repository.create({ name: "Alpha", quantity: 1 });
      await repository.create({ name: "Gamma", quantity: 3 });

      const result = await repository.findAll(
        new RepositoryQuery({
          search: "a",
          sort: "quantity",
          order: "desc",
          ...(options.paginated === false ? {} : { page: 2, limit: 1 }),
        }),
      );
      if (options.paginated === false) {
        expect(result).toMatchObject([
          { name: "Gamma", quantity: 3 },
          { name: "Beta", quantity: 2 },
          { name: "Alpha", quantity: 1 },
        ]);
      } else {
        expect(result).toMatchObject({
          data: [{ name: "Beta", quantity: 2 }],
          meta: { page: 2, limit: 1, total: 3, totalPages: 3 },
        });
      }
    });

    it("updates and deletes with consistent not-found behavior", async () => {
      const created = await repository.create({ name: "Alpha", quantity: 1 });

      await expect(
        repository.update(created.id, { quantity: 7 }),
      ).resolves.toMatchObject({ quantity: 7 });
      await expect(repository.remove(created.id)).resolves.toEqual({
        deleted: true,
      });
      await expect(repository.findOne(created.id)).rejects.toBeInstanceOf(
        RepositoryNotFoundError,
      );
    });

    it("bulk deletes unique ids and ignores missing values", async () => {
      const first = await repository.create({ name: "Alpha", quantity: 1 });
      const second = await repository.create({ name: "Beta", quantity: 2 });

      await expect(
        repository.removeMany([first.id, first.id, second.id]),
      ).resolves.toEqual({ deleted: 2 });
    });
  });
}
