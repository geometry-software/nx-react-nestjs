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
  RepositoryValidationError,
} from "../core/errors.js";
import type { CollectionApiAdapterOptions } from "../core/repository.js";
import type {
  BulkDeleteResult,
  RepositoryOptions,
  RepositoryRecord,
} from "../core/types.js";
import {
  createObjectStorageCodec,
  type RepositoryStorageCodec,
} from "../storage-codec.js";
import type {
  FirebaseCursorResult,
  FirebaseQueryPort,
  FirebaseRepositoryAdapterPort,
  FirebaseRepositoryQuery,
} from "./types.js";

export type FirebaseAdapterOptions<
  TEntity extends object,
  TCreate extends object,
  TUpdate extends object,
> = CollectionApiAdapterOptions & {
  firestore: Firestore;
  options: RepositoryOptions<TEntity>;
  codec?: RepositoryStorageCodec<TEntity, TCreate, TUpdate>;
};

export function createFirebaseAdapter<
  TEntity extends object,
  TCreate extends object,
  TUpdate extends object,
>(
  options: FirebaseAdapterOptions<TEntity, TCreate, TUpdate>,
): FirebaseRepositoryAdapter<TEntity, TCreate, TUpdate> {
  return new FirebaseRepositoryAdapter(
    options.firestore,
    options.source,
    options.options,
    options.codec,
  );
}

export class FirebaseRepositoryAdapter<
  TEntity extends object,
  TCreate extends object,
  TUpdate extends object,
> implements
    FirebaseRepositoryAdapterPort<TEntity, TCreate, TUpdate>,
    FirebaseQueryPort<TEntity>
{
  constructor(
    private readonly firestore: Firestore,
    public readonly source: string,
    private readonly options: RepositoryOptions<TEntity>,
    private readonly codec: RepositoryStorageCodec<
      TEntity,
      TCreate,
      TUpdate
    > = createObjectStorageCodec(),
  ) {}

  async findAll(): Promise<TEntity[]>;
  async findAll(
    request: FirebaseRepositoryQuery<TEntity>,
  ): Promise<FirebaseCursorResult<TEntity>>;
  async findAll(
    request?: FirebaseRepositoryQuery<TEntity>,
  ): Promise<TEntity[] | FirebaseCursorResult<TEntity>> {
    if (request === undefined) {
      const snapshot = await getDocs(
        collection(this.firestore, this.source),
      );
      return snapshot.docs.map((document) =>
        this.codec.decode(document.data() as RepositoryRecord, document.id),
      );
    }
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
    const requestedOrder = request.orderBy ?? this.options.defaultSort;
    if (requestedOrder) {
      const field =
        this.options.sortFieldMap?.[requestedOrder] ?? requestedOrder;
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
      this.codec.decode(
        snapshotDocument.data() as RepositoryRecord,
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

  async create(value: TCreate): Promise<TEntity> {
    const documentReference = doc(
      collection(this.firestore, this.source),
    );
    const record = this.codec.encodeCreate(value, {
      id: documentReference.id,
      now: new Date(),
    });
    await setDoc(documentReference, record as DocumentData);
    return this.codec.decode(record, documentReference.id);
  }

  async findOne(id: string): Promise<TEntity> {
    const snapshot = await getDoc(doc(this.firestore, this.source, id));
    if (!snapshot.exists()) {
      throw new RepositoryNotFoundError(this.options.entityName, id);
    }
    return this.codec.decode(snapshot.data() as RepositoryRecord, snapshot.id);
  }

  async update(id: string, value: TUpdate): Promise<TEntity> {
    await this.findOne(id);
    const record = this.codec.encodeUpdate(value, { id, now: new Date() });
    await updateDoc(
      doc(this.firestore, this.source, id),
      record as DocumentData,
    );
    return this.findOne(id);
  }

  async remove(id: string): Promise<{ deleted: true }> {
    await this.findOne(id);
    await deleteDoc(doc(this.firestore, this.source, id));
    return { deleted: true };
  }

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
}
