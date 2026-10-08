import { beforeEach, describe, expect, it } from "vitest";
import {
  RepositoryNotFoundError,
  type CollectionAdapter,
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
export type ConformanceAdapter = Omit<CollectionAdapter<
  ConformanceItem,
  CreateConformanceItem,
  UpdateConformanceItem,
  string
>, 'getSource' | 'setSource'>;

export function adapterConformanceSuite(
  name: string,
  createAdapter: () =>
    ConformanceAdapter | Promise<ConformanceAdapter>,
): void {
  describe(`${name} adapter conformance`, () => {
    let adapter: ConformanceAdapter;

    beforeEach(async () => {
      adapter = await createAdapter();
    });

    it("creates and finds a value by id", async () => {
      const created = await adapter.create({ name: "Alpha", quantity: 1 });

      await expect(adapter.findOne(created.id)).resolves.toEqual(created);
    });

    it("reads every record without a query", async () => {
      await adapter.create({ name: "Beta", quantity: 2 });
      await adapter.create({ name: "Alpha", quantity: 1 });
      await adapter.create({ name: "Gamma", quantity: 3 });

      await expect(adapter.findAll()).resolves.toMatchObject([
        { name: "Beta", quantity: 2 },
        { name: "Alpha", quantity: 1 },
        { name: "Gamma", quantity: 3 },
      ]);
    });

    it("updates and deletes with consistent not-found behavior", async () => {
      const created = await adapter.create({ name: "Alpha", quantity: 1 });

      await expect(
        adapter.update(created.id, { quantity: 7 }),
      ).resolves.toMatchObject({ quantity: 7 });
      await expect(adapter.remove(created.id)).resolves.toEqual({
        deleted: true,
      });
      await expect(adapter.findOne(created.id)).rejects.toBeInstanceOf(
        RepositoryNotFoundError,
      );
    });

    it("bulk deletes unique ids and ignores missing values", async () => {
      const first = await adapter.create({ name: "Alpha", quantity: 1 });
      const second = await adapter.create({ name: "Beta", quantity: 2 });

      await expect(
        adapter.removeMany([first.id, first.id, second.id]),
      ).resolves.toEqual({ deleted: 2 });
    });
  });
}
