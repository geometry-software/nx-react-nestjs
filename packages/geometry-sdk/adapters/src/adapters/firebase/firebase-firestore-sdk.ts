import * as firestore from 'firebase/firestore';

export type { DocumentData, Firestore, QueryConstraint } from 'firebase/firestore';

/** Firestore operations used by the adapter and its connection lifecycle. */
export interface FirestoreSdk {
  collection: typeof firestore.collection;
  deleteDoc: typeof firestore.deleteDoc;
  deleteField: typeof firestore.deleteField;
  doc: typeof firestore.doc;
  endBefore: typeof firestore.endBefore;
  getCountFromServer: typeof firestore.getCountFromServer;
  getDoc: typeof firestore.getDoc;
  getDocs: typeof firestore.getDocs;
  getFirestore: typeof firestore.getFirestore;
  increment: typeof firestore.increment;
  initializeFirestore: typeof firestore.initializeFirestore;
  limit: typeof firestore.limit;
  limitToLast: typeof firestore.limitToLast;
  orderBy: typeof firestore.orderBy;
  query: typeof firestore.query;
  setDoc: typeof firestore.setDoc;
  startAfter: typeof firestore.startAfter;
  updateDoc: typeof firestore.updateDoc;
  where: typeof firestore.where;
  writeBatch: typeof firestore.writeBatch;
}

const sdk: FirestoreSdk = {
  collection: firestore.collection,
  deleteDoc: firestore.deleteDoc,
  deleteField: firestore.deleteField,
  doc: firestore.doc,
  endBefore: firestore.endBefore,
  getCountFromServer: firestore.getCountFromServer,
  getDoc: firestore.getDoc,
  getDocs: firestore.getDocs,
  getFirestore: firestore.getFirestore,
  increment: firestore.increment,
  initializeFirestore: firestore.initializeFirestore,
  limit: firestore.limit,
  limitToLast: firestore.limitToLast,
  orderBy: firestore.orderBy,
  query: firestore.query,
  setDoc: firestore.setDoc,
  startAfter: firestore.startAfter,
  updateDoc: firestore.updateDoc,
  where: firestore.where,
  writeBatch: firestore.writeBatch,
};

/** Returns a reference to a named collection. */
export const collection: FirestoreSdk['collection'] = sdk.collection;

/** Deletes a document reference. */
export const deleteDoc: FirestoreSdk['deleteDoc'] = sdk.deleteDoc;

/** Creates a sentinel that removes a field during an update. */
export const deleteField: FirestoreSdk['deleteField'] = sdk.deleteField;

/** Returns a reference to a document. */
export const doc: FirestoreSdk['doc'] = sdk.doc;

/** Creates a cursor constraint ending before a document or field value. */
export const endBefore: FirestoreSdk['endBefore'] = sdk.endBefore;

/** Reads the server-side count for a query. */
export const getCountFromServer: FirestoreSdk['getCountFromServer'] = sdk.getCountFromServer;

/** Reads one document. */
export const getDoc: FirestoreSdk['getDoc'] = sdk.getDoc;

/** Reads all documents matching a query. */
export const getDocs: FirestoreSdk['getDocs'] = sdk.getDocs;

/** Returns the Firestore instance associated with an app. */
export const getFirestore: FirestoreSdk['getFirestore'] = sdk.getFirestore;

/** Creates an atomic numeric increment sentinel. */
export const increment: FirestoreSdk['increment'] = sdk.increment;

/** Initializes a Firestore instance with explicit settings. */
export const initializeFirestore: FirestoreSdk['initializeFirestore'] = sdk.initializeFirestore;

/** Limits the number of documents returned from the beginning of a query. */
export const limit: FirestoreSdk['limit'] = sdk.limit;

/** Limits the number of documents returned from the end of a query. */
export const limitToLast: FirestoreSdk['limitToLast'] = sdk.limitToLast;

/** Creates an ordering constraint for a field. */
export const orderBy: FirestoreSdk['orderBy'] = sdk.orderBy;

/** Combines a collection or query reference with query constraints. */
export const query: FirestoreSdk['query'] = sdk.query;

/** Writes a document, replacing it unless merge options are supplied. */
export const setDoc: FirestoreSdk['setDoc'] = sdk.setDoc;

/** Creates a cursor constraint starting after a document or field value. */
export const startAfter: FirestoreSdk['startAfter'] = sdk.startAfter;

/** Updates fields in an existing document. */
export const updateDoc: FirestoreSdk['updateDoc'] = sdk.updateDoc;

/** Creates a field comparison constraint. */
export const where: FirestoreSdk['where'] = sdk.where;

/** Creates a batch for atomic document writes. */
export const writeBatch: FirestoreSdk['writeBatch'] = sdk.writeBatch;
