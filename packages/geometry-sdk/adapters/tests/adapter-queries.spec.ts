import type { SupabaseClient } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";

const firestore = vi.hoisted(() => ({
  collection: vi.fn(() => ({ kind: "collection" })),
  deleteDoc: vi.fn(),
  doc: vi.fn((_firestore, _collectionName, id?: string) => ({ id })),
  endBefore: vi.fn((cursor) => ({ type: "endBefore", cursor })),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  limit: vi.fn((value) => ({ type: "limit", value })),
  limitToLast: vi.fn((value) => ({ type: "limitToLast", value })),
  orderBy: vi.fn((field, direction) => ({
    type: "orderBy",
    field,
    direction,
  })),
  query: vi.fn((_collection, ...constraints) => ({ constraints })),
  setDoc: vi.fn(),
  startAfter: vi.fn((cursor) => ({ type: "startAfter", cursor })),
  updateDoc: vi.fn(),
  where: vi.fn((field, operator, value) => ({
    type: "where",
    field,
    operator,
    value,
  })),
  writeBatch: vi.fn(),
}));

vi.mock("firebase/firestore", () => firestore);

import { FirebaseRepositoryAdapter } from "geometry-sdk/adapters";
import { SupabaseJsRepositoryAdapter } from "geometry-sdk/adapters";

type Item = { id: string; name: string; score: number };

const options = {
  entityName: "Item",
  searchableFields: ["name"],
  sortableFields: ["name", "score"],
  defaultSort: "score",
} as const;

describe("Supabase JS query port", () => {
  it("translates filters, ordering, page, and limit to PostgREST calls", async () => {
    const calls: unknown[][] = [];
    const builder = {
      select: vi.fn(() => builder),
      eq: vi.fn((...args: unknown[]) => (calls.push(["eq", ...args]), builder)),
      neq: vi.fn((...args: unknown[]) => (calls.push(["neq", ...args]), builder)),
      gt: vi.fn((...args: unknown[]) => (calls.push(["gt", ...args]), builder)),
      gte: vi.fn((...args: unknown[]) => (calls.push(["gte", ...args]), builder)),
      lt: vi.fn((...args: unknown[]) => (calls.push(["lt", ...args]), builder)),
      lte: vi.fn((...args: unknown[]) => (calls.push(["lte", ...args]), builder)),
      like: vi.fn((...args: unknown[]) => (calls.push(["like", ...args]), builder)),
      ilike: vi.fn((...args: unknown[]) => (calls.push(["ilike", ...args]), builder)),
      in: vi.fn((...args: unknown[]) => (calls.push(["in", ...args]), builder)),
      is: vi.fn((...args: unknown[]) => (calls.push(["is", ...args]), builder)),
      order: vi.fn((...args: unknown[]) => (calls.push(["order", ...args]), builder)),
      range: vi.fn(async (...args: unknown[]) => {
        calls.push(["range", ...args]);
        return {
          data: [{ id: "2", name: "Beta", score: 20 }],
          error: null,
          count: 5,
        };
      }),
    };
    const client = {
      from: vi.fn(() => builder),
    } as unknown as SupabaseClient;
    const repository = new SupabaseJsRepositoryAdapter<
      Item,
      Item,
      Partial<Item>
    >(
      client,
      "items",
      options,
    );

    const result = await repository.findAll({
      page: 2,
      limit: 2,
      filters: [
        { column: "name", operator: "ilike", value: "%beta%" },
        { column: "score", operator: "gte", value: 10 },
      ],
      order: [{ column: "score", direction: "asc" }],
    });

    expect(calls).toEqual([
      ["ilike", "name", "%beta%"],
      ["gte", "score", 10],
      ["order", "score", { ascending: true }],
      ["range", 2, 3],
    ]);
    expect(result.meta).toEqual({
      page: 2,
      limit: 2,
      total: 5,
      totalPages: 3,
    });
  });
});

describe("Firebase query port", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses a document id as a next cursor", async () => {
    const cursor = documentSnapshot("b", 2);
    firestore.getDoc.mockResolvedValue(cursor);
    firestore.getDocs.mockResolvedValue({
      docs: [
        documentSnapshot("c", 3),
        documentSnapshot("d", 4),
        documentSnapshot("e", 5),
      ],
    });
    const repository = new FirebaseRepositoryAdapter<
      Item,
      Item,
      Partial<Item>
    >(
      {} as never,
      "items",
      options,
    );

    const result = await repository.findAll({
      limit: 2,
      orderBy: "score",
      order: "asc",
      next: "b",
      filters: [{ field: "score", operator: ">", value: 0 }],
    });

    expect(firestore.startAfter).toHaveBeenCalledWith(cursor);
    expect(firestore.limit).toHaveBeenCalledWith(3);
    expect(result).toEqual({
      data: [
        { id: "c", name: "Item c", score: 3 },
        { id: "d", name: "Item d", score: 4 },
      ],
      pageInfo: {
        limit: 2,
        next: "d",
        before: "c",
        hasNext: true,
        hasPrevious: true,
      },
    });
  });

  it("uses endBefore and limitToLast for a previous page", async () => {
    const cursor = documentSnapshot("f", 6);
    firestore.getDoc.mockResolvedValue(cursor);
    firestore.getDocs.mockResolvedValue({
      docs: [
        documentSnapshot("c", 3),
        documentSnapshot("d", 4),
        documentSnapshot("e", 5),
      ],
    });
    const repository = new FirebaseRepositoryAdapter<
      Item,
      Item,
      Partial<Item>
    >(
      {} as never,
      "items",
      options,
    );

    const result = await repository.findAll({ limit: 2, before: "f" });

    expect(firestore.endBefore).toHaveBeenCalledWith(cursor);
    expect(firestore.limitToLast).toHaveBeenCalledWith(3);
    expect(result.data.map((item) => item.id)).toEqual(["d", "e"]);
    expect(result.pageInfo).toEqual({
      limit: 2,
      next: "e",
      before: "d",
      hasNext: true,
      hasPrevious: true,
    });
  });
});

function documentSnapshot(id: string, score: number) {
  return {
    id,
    exists: () => true,
    data: () => ({ id, name: `Item ${id}`, score }),
  };
}
