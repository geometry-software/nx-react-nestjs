import {
  collection,
  deleteDoc,
  doc,
  endBefore,
  getDoc,
  getDocs,
  limit,
  limitToLast,
  orderBy,
  query as firestoreQuery,
  setDoc,
  startAfter,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
  type Firestore,
  type QueryConstraint,
} from "./firebase-firestore-sdk.js";
import {
  RepositoryNotFoundError,
  RepositoryOperationError,
  RepositoryValidationError,
} from "../core/errors.js";
import type {
  BulkDeleteResult,
  PageableOptions,
} from "../core/api.js";
import type {
  FirebaseCursorResult,
  FirebaseQueryPort,
  FirestoreAdapterPort,
  FirebaseRepositoryQuery,
} from "./types.js";

export type FirebaseAdapterOptions<
  TEntity extends object,
  TCreate extends object,
  TUpdate extends object,
> = {
  source: string;
  firestore: Firestore;
  options: { entityName: string; pageable?: PageableOptions<TEntity> };
};

export function createFirebaseAdapter<
  TEntity extends object,
  TCreate extends object,
  TUpdate extends object,
>(
  options: FirebaseAdapterOptions<TEntity, TCreate, TUpdate>,
): FirestoreAdapter<TEntity, TCreate, TUpdate> {
  return new FirestoreAdapter(
    options.firestore,
    options.source,
    options.options,
  );
}

export class FirestoreAdapter<
  TEntity extends object,
  TCreate extends object,
  TUpdate extends object,
> implements
    FirestoreAdapterPort<TEntity, TCreate, TUpdate>,
    FirebaseQueryPort<TEntity>
{
  constructor(
    private readonly firestore: Firestore,
    private source: string,
    private readonly options: { entityName: string; pageable?: PageableOptions<TEntity> },
  ) {}

  /** Returns the currently selected collection or table. */
  public getSource(): string {
    return this.source;
  }

  /** Selects the collection or table used by subsequent operations. */
  public setSource(source: string): void {
    this.source = source;
  }

  /** Returns every record from the selected source. */
  public async findAll(): Promise<TEntity[]> {
    const snapshot = await getDocs(collection(this.firestore, this.source));
    return snapshot.docs.map((document) =>
      this.decode(document.data() as Record<string, unknown>, document.id),
    );
  }

  /** Rejects raw queries, which Firestore does not support. */
  public async query(_expression: string): Promise<TEntity[]> {
    throw new RepositoryOperationError('Firebase query is not supported');
  }

  /** Returns a Firestore cursor page with next and previous cursor metadata. */
  public async findPage(request: FirebaseRepositoryQuery<TEntity>): Promise<FirebaseCursorResult<TEntity>> {
    if (request.next !== undefined && request.before !== undefined) {
      throw new RepositoryValidationError(
        "Firebase query accepts either next or before, not both",
      );
    }
    if (!Number.isInteger(request.limit) || request.limit < 1) {
      throw new RepositoryValidationError(
        "Firebase query limit must be a positive integer",
      );
    }

    const constraints: QueryConstraint[] = (request.filters ?? []).map(
      (filter) => where(filter.field, filter.operator, filter.value),
    );
    const requestedOrder = request.orderBy ?? this.options.pageable?.defaultSort;
    if (requestedOrder) {
      const field =
        this.options.pageable?.sortFieldMap?.[requestedOrder] ?? requestedOrder;
      constraints.push(orderBy(field, request.order ?? "desc"));
    }

    const cursorId = request.next ?? request.before;
    if (cursorId !== undefined) {
      const cursor = await getDoc(
        doc(this.firestore, this.source, cursorId),
      );
      if (!cursor.exists()) {
        throw new RepositoryNotFoundError(
          `${this.options.entityName} cursor`,
          cursorId,
        );
      }
      constraints.push(
        request.next !== undefined ? startAfter(cursor) : endBefore(cursor),
      );
    }

    constraints.push(
      request.before !== undefined
        ? limitToLast(request.limit + 1)
        : limit(request.limit + 1),
    );
    const snapshot = await getDocs(
      firestoreQuery(
        collection(this.firestore, this.source),
        ...constraints,
      ),
    );
    const hasExtra = snapshot.docs.length > request.limit;
    const documents = request.before !== undefined
      ? snapshot.docs.slice(hasExtra ? 1 : 0)
      : snapshot.docs.slice(0, request.limit);
    const data = documents.map((snapshotDocument) =>
      this.decode(
        snapshotDocument.data() as Record<string, unknown>,
        snapshotDocument.id,
      ),
    );
    const firstId = documents[0]?.id;
    const lastId = documents.at(-1)?.id;
    const isPreviousPageRequest = request.before !== undefined;
    const hasPrevious = isPreviousPageRequest
      ? hasExtra
      : request.next !== undefined;
    const hasNext = isPreviousPageRequest ? true : hasExtra;

    return {
      data,
      pageInfo: {
        limit: request.limit,
        hasNext,
        hasPrevious,
        ...(hasNext && lastId ? { next: lastId } : {}),
        ...(hasPrevious && firstId ? { before: firstId } : {}),
      },
    };
  }

  /** Creates a record and returns its stored representation. */
  public async create(value: TEntity | TCreate): Promise<TEntity> {
    const documentReference = doc(
      collection(this.firestore, this.source),
    );
    const now = new Date();
    const record = { ...value, createdAt: now, updatedAt: now };
    await setDoc(documentReference, record as DocumentData);
    return this.decode(record, documentReference.id);
  }

  /** Returns a record by ID or raises a not-found error. */
  async findOne(id: string): Promise<TEntity> {
    const snapshot = await getDoc(doc(this.firestore, this.source, id));
    if (!snapshot.exists()) {
      throw new RepositoryNotFoundError(this.options.entityName, id);
    }
    return this.decode(snapshot.data() as Record<string, unknown>, snapshot.id);
  }

  /** Updates a record by ID and returns its current representation. */
  async update(id: string, value: TUpdate): Promise<TEntity> {
    await this.findOne(id);
    const record = { ...value, updatedAt: new Date() };
    await updateDoc(
      doc(this.firestore, this.source, id),
      record as DocumentData,
    );
    return this.findOne(id);
  }

  /** Deletes a record by ID or raises a not-found error. */
  async remove(id: string): Promise<{ deleted: true }> {
    await this.findOne(id);
    await deleteDoc(doc(this.firestore, this.source, id));
    return { deleted: true };
  }

  /** Deletes the supplied IDs and reports the number removed. */
  async removeMany(ids: string[]): Promise<BulkDeleteResult> {
    const uniqueIds = [...new Set(ids)];
    const snapshots = await Promise.all(
      uniqueIds.map((id) =>
        getDoc(doc(this.firestore, this.source, id)),
      ),
    );
    const existingIds = snapshots
      .filter((snapshot) => snapshot.exists())
      .map((snapshot) => snapshot.id);
    for (let start = 0; start < existingIds.length; start += 500) {
      const batch = writeBatch(this.firestore);
      for (const id of existingIds.slice(start, start + 500)) {
        batch.delete(doc(this.firestore, this.source, id));
      }
      await batch.commit();
    }
    return { deleted: existingIds.length };
  }

  private decode(record: Record<string, unknown>, id: string): TEntity {
    return { ...record, id } as TEntity;
  }
}
