// fx/firestore.ts
import { signal, inject, DestroyRef } from '@angular/core';
import {
  DocumentReference,
  CollectionReference,
  DocumentData,
  Query,
  QueryDocumentSnapshot,
  onSnapshot,
  doc,
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  endBefore,
  QueryConstraint,
  DocumentSnapshot
} from 'firebase/firestore';
import { FIREBASE_FIRESTORE } from './app';

export type FirestoreStatus = 'idle' | 'loading' | 'success' | 'error';

export interface FirestoreOptions<T = DocumentData> {
  includeMetadataChanges?: boolean;
  transform?: (doc: QueryDocumentSnapshot<T>) => any;
}

// Document data function
export function docData<T = DocumentData>(
  ref: DocumentReference<T>,
  options: FirestoreOptions<T> = {}
) {
  const data = signal<T | null>(null);
  const status = signal<FirestoreStatus>('loading');
  const error = signal<string | null>(null);
  const metadata = signal<{ fromCache: boolean; hasPendingWrites: boolean } | null>(null);

  const destroyRef = inject(DestroyRef);
  
  const unsub = onSnapshot(
    ref,
    (doc) => {
      if (doc.exists()) {
        const docData = options.transform 
          ? options.transform(doc as QueryDocumentSnapshot<T>)
          : doc.data();
        data.set(docData);
        metadata.set({
          fromCache: doc.metadata.fromCache,
          hasPendingWrites: doc.metadata.hasPendingWrites
        });
      } else {
        data.set(null);
        metadata.set(null);
      }
      status.set('success');
      error.set(null);
    },
    (err) => {
      status.set('error');
      error.set(err.message);
      data.set(null);
      metadata.set(null);
    }
  );

  destroyRef.onDestroy(unsub);

  return { data, status, error, metadata };
}

// Collection data function
export function collectionData<T = DocumentData>(
  ref: CollectionReference<T> | Query<T>,
  options: FirestoreOptions<T> = {}
) {
  const data = signal<T[]>([]);
  const status = signal<FirestoreStatus>('loading');
  const error = signal<string | null>(null);
  const metadata = signal<{ fromCache: boolean; hasPendingWrites: boolean } | null>(null);

  const destroyRef = inject(DestroyRef);
  
  const unsub = onSnapshot(
    ref,
    (snapshot) => {
      const docs = snapshot.docs.map(doc => {
        if (options.transform) {
          return options.transform(doc);
        }
        return { id: doc.id, ...doc.data() };
      });
      
      data.set(docs);
      metadata.set({
        fromCache: snapshot.metadata.fromCache,
        hasPendingWrites: snapshot.metadata.hasPendingWrites
      });
      status.set('success');
      error.set(null);
    },
    (err) => {
      status.set('error');
      error.set(err.message);
      data.set([]);
      metadata.set(null);
    }
  );

  destroyRef.onDestroy(unsub);

  return { data, status, error, metadata };
}

// Helper functions for building queries
export function createQuery<T = DocumentData>(
  collectionRef: CollectionReference<T>,
  ...constraints: QueryConstraint[]
): Query<T> {
  return query(collectionRef, ...constraints);
}

export function whereField(field: string, op: '==' | '!=' | '<' | '<=', value: any) {
  return where(field, op, value);
}

export function orderByField(field: string, direction: 'asc' | 'desc' = 'asc') {
  return orderBy(field, direction);
}

export function limitResults(limitCount: number) {
  return limit(limitCount);
}

export function startAfterDoc(doc: DocumentSnapshot) {
  return startAfter(doc);
}

export function endBeforeDoc(doc: DocumentSnapshot) {
  return endBefore(doc);
}

// Utility functions for common Firestore operations
export function useDocRef<T = DocumentData>(path: string) {
  const firestore = inject(FIREBASE_FIRESTORE);
  return doc(firestore, path);
}

export function useCollectionRef<T = DocumentData>(path: string) {
  const firestore = inject(FIREBASE_FIRESTORE);
  return collection(firestore, path);
}

export function useQuery<T = DocumentData>(
  collectionRef: CollectionReference<T>,
  ...constraints: QueryConstraint[]
) {
  return query(collectionRef, ...constraints);
}
