import { randomUUID } from 'node:crypto';
import { createMemoryAdapter, MemoryAdapter } from 'geometry-sdk/adapters';
import { describe, expect, it } from 'vitest';
import {
  adapterConformanceSuite,
  type ConformanceItem,
  type CreateConformanceItem,
  type UpdateConformanceItem,
} from './adapter-conformance.js';

const options = {
  entityName: 'Item',
} as const;

adapterConformanceSuite('Memory', () =>
  createMemoryAdapter<ConformanceItem, CreateConformanceItem, UpdateConformanceItem>({
    options,
    getId: (value) => value.id,
    createId: () => randomUUID(),
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
);

describe('MemoryAdapter additional public methods', () => {
  function createAdapter() {
    return new MemoryAdapter<ConformanceItem, CreateConformanceItem, UpdateConformanceItem>({
      source: 'items',
      options: { entityName: 'Item' },
      initialData: [{ id: 'first', name: 'Alpha', quantity: 2, createdAt: new Date(0), updatedAt: new Date(0) }],
      getId: (value) => value.id,
      createId: () => 'second',
      create: (value, { id, now }) => ({ ...value, id, createdAt: now, updatedAt: now }),
      update: (current, value, now) => ({ ...current, ...value, updatedAt: now }),
    });
  }

  it('getSource returns the initial collection', () => {
    expect(createAdapter().getSource()).toBe('items');
  });

  it('setSource isolates collections by source name', async () => {
    const adapter = createAdapter();
    adapter.setSource('archive');
    expect(adapter.getSource()).toBe('archive');
    await expect(adapter.findAll()).resolves.toEqual([]);
    adapter.setSource('items');
    await expect(adapter.findAll()).resolves.toHaveLength(1);
  });

  it('compute receives a stable snapshot of the selected collection', async () => {
    const adapter = createAdapter();
    await expect(adapter.compute((records) => records.reduce((sum, item) => sum + item.quantity, 0)))
      .resolves.toBe(2);
  });
});
