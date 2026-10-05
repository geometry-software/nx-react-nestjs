import type { PageableCollectionApi } from '../core/pageable.js';
import { FirebaseRepositoryAdapter } from './firebase-repository-adapter.js';
import type { FirebaseCursorResult, FirebaseRepositoryQuery } from './types.js';

/** Firestore uses document cursors, startAfter/endBefore and limit/limitToLast. */
export class FirebaseCollectionProviderAdapter<
  TData extends object,
  TCreate extends object = TData,
  TUpdate extends object = Partial<TCreate>,
> extends FirebaseRepositoryAdapter<TData, TCreate, TUpdate>
  implements PageableCollectionApi<
    TData, TCreate, TUpdate, FirebaseRepositoryQuery<TData>, FirebaseCursorResult<TData>
  > {
  findPage(request: FirebaseRepositoryQuery<TData>): Promise<FirebaseCursorResult<TData>> {
    return this.findAll(request);
  }
}
