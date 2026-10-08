import type { SupabaseClient } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";

const firestore = vi.hoisted(() => ({
  collection: vi.fn(() => ({ kind: "collection" })),
  deleteDoc: vi.fn(),
  deleteField: vi.fn(),
  getCountFromServer: vi.fn(),
  getFirestore: vi.fn(),
  increment: vi.fn(),
  initializeFirestore: vi.fn(),
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

import { FirestoreAdapter } from "../src/adapters/firebase/firestore.adapter.js";
import { SupabaseJsAdapter } from "../src/adapters/supabase/supabase-js.adapter.js";

type Item = { id: string; name: string; score: number };

const options = {
  entityName: "Item",
  pageable: {
    searchableFields: ["name"],
    sortableFields: ["name", "score"],
    defaultSort: "score",
  },
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
    const repository = new SupabaseJsAdapter<
      Item,
      Item,
      Partial<Item>
    >(
      client,
      "items",
      options,
    );

    const result = await repository.findPage({
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
    });
  });
});

describe('SupabaseJsAdapter public methods', () => {
  function setup() {
    const builder = {
      select: vi.fn(() => builder), order: vi.fn(() => builder),
      range: vi.fn().mockResolvedValue({ data: [{ id: 'a', name: 'Alpha', score: 1 }], error: null, count: 1 }),
      insert: vi.fn(() => builder), update: vi.fn(() => builder), delete: vi.fn(() => builder),
      eq: vi.fn(() => builder), in: vi.fn(() => builder),
      single: vi.fn().mockResolvedValue({ data: { id: 'a', name: 'Alpha', score: 1 }, error: null }),
      maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'a', name: 'Alpha', score: 1 }, error: null }),
    };
    const client = { from: vi.fn(() => builder) } as unknown as SupabaseClient;
    const adapter = new SupabaseJsAdapter<Item, Item, Partial<Item>>(client, 'items', options);
    return { adapter, client, builder };
  }

  it('getSource reports the selected table', () => {
    expect(setup().adapter.getSource()).toBe('items');
  });

  it('setSource changes the table used by subsequent queries', async () => {
    const { adapter, client } = setup();
    adapter.setSource('archive');
    await adapter.findPage({ page: 1, limit: 1 });
    expect(adapter.getSource()).toBe('archive');
    expect(client.from).toHaveBeenCalledWith('archive');
  });

  it('findAll reads all batches until an empty batch', async () => {
    const { adapter, builder } = setup();
    builder.range.mockResolvedValueOnce({ data: [{ id: 'a', name: 'Alpha', score: 1 }], error: null })
      .mockResolvedValueOnce({ data: [], error: null });
    await expect(adapter.findAll()).resolves.toEqual([{ id: 'a', name: 'Alpha', score: 1 }]);
    expect(builder.range).toHaveBeenCalledTimes(2);
  });

  it('query parses a JSON page request and rejects invalid JSON', async () => {
    const { adapter } = setup();
    await expect(adapter.query('{"page":1,"limit":1}')).resolves.toHaveLength(1);
    await expect(adapter.query('invalid')).rejects.toThrow('must be JSON');
  });

  it('create returns the record inserted by Supabase', async () => {
    const { adapter, builder } = setup();
    await expect(adapter.create({ id: 'a', name: 'Alpha', score: 1 })).resolves.toMatchObject({ id: 'a' });
    expect(builder.insert).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Alpha', createdAt: expect.any(String), updatedAt: expect.any(String),
    }));
  });

  it('findOne uses the configured ID column and reports missing rows', async () => {
    const { adapter, builder } = setup();
    await expect(adapter.findOne('a')).resolves.toMatchObject({ id: 'a' });
    expect(builder.eq).toHaveBeenCalledWith('id', 'a');
    builder.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    await expect(adapter.findOne('missing')).rejects.toThrow('not found');
  });

  it('update checks the row and writes an update timestamp', async () => {
    const { adapter, builder } = setup();
    await expect(adapter.update('a', { score: 2 })).resolves.toMatchObject({ id: 'a' });
    expect(builder.update).toHaveBeenCalledWith(expect.objectContaining({ score: 2, updatedAt: expect.any(String) }));
  });

  it('remove checks existence before deleting the row', async () => {
    const { adapter, builder } = setup();
    await expect(adapter.remove('a')).resolves.toEqual({ deleted: true });
    expect(builder.delete).toHaveBeenCalledTimes(1);
  });

  it('removeMany deduplicates IDs and returns the count of deleted rows', async () => {
    const { adapter, builder } = setup();
    builder.select.mockReturnValueOnce({ data: [{ id: 'a' }], error: null } as never);
    await expect(adapter.removeMany(['a', 'a', 'missing'])).resolves.toEqual({ deleted: 1 });
    expect(builder.in).toHaveBeenCalledWith('id', ['a', 'missing']);
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
    const repository = new FirestoreAdapter<
      Item,
      Item,
      Partial<Item>
    >(
      {} as never,
      "items",
      options,
    );

    const result = await repository.findPage({
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
    const repository = new FirestoreAdapter<
      Item,
      Item,
      Partial<Item>
    >(
      {} as never,
      "items",
      options,
    );

    const result = await repository.findPage({ limit: 2, before: "f" });

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

describe('FirestoreAdapter public methods', () => {
  beforeEach(() => vi.clearAllMocks());

  function adapter() {
    return new FirestoreAdapter<Item, Item, Partial<Item>>({} as never, 'items', options);
  }

  it('getSource returns the collection name', () => {
    expect(adapter().getSource()).toBe('items');
  });

  it('setSource changes the collection used by subsequent reads', async () => {
    const repository = adapter();
    repository.setSource('archive');
    firestore.getDocs.mockResolvedValue({ docs: [] });
    await repository.findAll();
    expect(repository.getSource()).toBe('archive');
    expect(firestore.collection).toHaveBeenCalledWith(expect.anything(), 'archive');
  });

  it('findAll maps document IDs onto returned records', async () => {
    firestore.getDocs.mockResolvedValue({ docs: [documentSnapshot('a', 1)] });
    await expect(adapter().findAll()).resolves.toEqual([{ id: 'a', name: 'Item a', score: 1 }]);
  });

  it('query rejects raw expressions instead of silently returning unrelated records', async () => {
    await expect(adapter().query('{}')).rejects.toThrow('not supported');
  });

  it('findPage validates conflicting cursors before contacting Firestore', async () => {
    await expect(adapter().findPage({ limit: 2, next: 'a', before: 'b' })).rejects.toThrow('either next or before');
    expect(firestore.getDocs).not.toHaveBeenCalled();
  });

  it('create writes timestamps and returns the generated document ID', async () => {
    firestore.doc.mockReturnValueOnce({ id: 'new' });
    await expect(adapter().create({ id: 'ignored', name: 'New', score: 2 })).resolves.toMatchObject({ id: 'new', name: 'New' });
    expect(firestore.setDoc).toHaveBeenCalledWith({ id: 'new' }, expect.objectContaining({
      createdAt: expect.any(Date), updatedAt: expect.any(Date),
    }));
  });

  it('findOne rejects a missing document', async () => {
    firestore.getDoc.mockResolvedValue({ id: 'missing', exists: () => false });
    await expect(adapter().findOne('missing')).rejects.toThrow('not found');
  });

  it('update checks existence and writes a new update timestamp', async () => {
    firestore.getDoc.mockResolvedValue(documentSnapshot('a', 1));
    await expect(adapter().update('a', { score: 2 })).resolves.toMatchObject({ id: 'a' });
    expect(firestore.updateDoc).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
      score: 2, updatedAt: expect.any(Date),
    }));
  });

  it('remove checks existence before deleting the document', async () => {
    firestore.getDoc.mockResolvedValue(documentSnapshot('a', 1));
    await expect(adapter().remove('a')).resolves.toEqual({ deleted: true });
    expect(firestore.deleteDoc).toHaveBeenCalledWith(expect.objectContaining({ id: 'a' }));
  });

  it('removeMany deletes only existing unique IDs in one batch', async () => {
    const batch = { delete: vi.fn(), commit: vi.fn().mockResolvedValue(undefined) };
    firestore.writeBatch.mockReturnValue(batch);
    firestore.getDoc.mockImplementation(async (reference: { id: string }) => ({
      id: reference.id, exists: () => reference.id !== 'missing',
    }));
    await expect(adapter().removeMany(['a', 'a', 'missing'])).resolves.toEqual({ deleted: 1 });
    expect(batch.delete).toHaveBeenCalledTimes(1);
    expect(batch.commit).toHaveBeenCalledTimes(1);
  });
});

describe('FirestoreAdapter.findPage', () => {
  it('uses the same cursor page contract as the repository adapter', async () => {
    firestore.getDocs.mockResolvedValue({ docs: [documentSnapshot('a', 1)] });
    const adapter = new FirestoreAdapter<Item, Item, Partial<Item>>({} as never, 'items', options);
    await expect(adapter.findPage({ limit: 2 })).resolves.toMatchObject({
      data: [{ id: 'a' }], pageInfo: { hasNext: false, hasPrevious: false },
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
