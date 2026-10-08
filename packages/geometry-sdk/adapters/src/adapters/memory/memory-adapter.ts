import {
  RepositoryConflictError,
  RepositoryNotFoundError,
} from "../core/errors.js";
import type { CollectionAdapter } from "../core/api.js";
import type { MemoryAdapterPort } from "./types.js";

export type MemoryAdapterContext<TId> = {
  id: TId;
  now: Date;
};

export type MemoryAdapterOptions<TData, TCreate, TUpdate, TId = string> = {
  options: { entityName: string };
  source?: string;
  initialData?: readonly TData[];
  getId: (value: TData) => TId;
  createId: (value: TCreate) => TId;
  create: (value: TCreate, context: MemoryAdapterContext<TId>) => TData;
  update: (current: TData, value: TUpdate, now: Date) => TData;
};

export function createMemoryAdapter<TData, TCreate, TUpdate, TId = string>(
  config: MemoryAdapterOptions<TData, TCreate, TUpdate, TId>,
): MemoryAdapterPort<TData, TCreate, TUpdate, TId> {
  return new MemoryAdapter(config);
}

export class MemoryAdapter<TData, TCreate, TUpdate, TId = string>
  implements CollectionAdapter<TData, TUpdate, TId> {
  private readonly collections = new Map<string, Map<TId, TData>>();
  private source: string;

  constructor(private readonly config: MemoryAdapterOptions<TData, TCreate, TUpdate, TId>) {
    this.source = config.source ?? config.options.entityName;
    const values = new Map<TId, TData>();
    for (const value of config.initialData ?? []) {
      values.set(config.getId(value), value);
    }
    this.collections.set(this.source, values);
  }

  /** Returns the currently selected collection or table. */
  public getSource(): string {
    return this.source;
  }

  /** Selects the collection or table used by subsequent operations. */
  public setSource(source: string): void {
    this.source = source;
  }

  private get values(): Map<TId, TData> {
    let values = this.collections.get(this.source);
    if (!values) {
      values = new Map<TId, TData>();
      this.collections.set(this.source, values);
    }
    return values;
  }

  /** Applies a calculation to a snapshot of the in-memory collection. */
  public async compute<TResult>(calculation: (records: readonly TData[]) => TResult): Promise<TResult> {
    return calculation([...this.values.values()]);
  }

  /** Returns every record from the selected source. */
  public async findAll(): Promise<TData[]> {
    return [...this.values.values()];
  }

  /** Returns a record by ID or raises a not-found error. */
  public async findOne(id: TId): Promise<TData> {
    const value = this.values.get(id);
    if (value === undefined) {
      throw new RepositoryNotFoundError(this.config.options.entityName, id);
    }
    return value;
  }

  /** Creates a record and returns its stored representation. */
  public async create(value: TData | TCreate): Promise<TData> {
    const id = this.config.createId(value as TCreate);
    if (this.values.has(id)) {
      throw new RepositoryConflictError(
        `${this.config.options.entityName} already exists: ${String(id)}`,
      );
    }
    const created = this.config.create(value as TCreate, { id, now: new Date() });
    this.values.set(this.config.getId(created), created);
    return created;
  }

  /** Updates a record by ID and returns its current representation. */
  public async update(id: TId, value: TUpdate): Promise<TData> {
    const current = await this.findOne(id);
    const updated = this.config.update(current, value, new Date());
    this.values.set(id, updated);
    return updated;
  }

  /** Deletes a record by ID or raises a not-found error. */
  public async remove(id: TId): Promise<{ deleted: true }> {
    await this.findOne(id);
    this.values.delete(id);
    return { deleted: true };
  }

  /** Deletes the supplied IDs and reports the number removed. */
  public async removeMany(ids: TId[]): Promise<{ deleted: number }> {
    let deleted = 0;
    for (const id of new Set(ids)) {
      deleted += this.values.delete(id) ? 1 : 0;
    }
    return { deleted };
  }
}
