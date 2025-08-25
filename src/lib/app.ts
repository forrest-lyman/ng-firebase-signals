// fx/app.ts
import { InjectionToken, inject } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
  databaseURL?: string;
}

export interface ConfiguredServices {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
  storage: FirebaseStorage;
}

// Injection tokens
export const FIREBASE_APP = new InjectionToken<FirebaseApp>('FIREBASE_APP');
export const FIREBASE_AUTH = new InjectionToken<Auth>('FIREBASE_AUTH');
export const FIREBASE_FIRESTORE = new InjectionToken<Firestore>('FIREBASE_FIRESTORE');
export const FIREBASE_STORAGE = new InjectionToken<FirebaseStorage>('FIREBASE_STORAGE');

// Provider function
export function provideFirebase(config: FirebaseConfig) {
  return [
    {
      provide: FIREBASE_APP,
      useValue: initializeApp(config)
    },
    {
      provide: FIREBASE_AUTH,
      useFactory: (app: FirebaseApp) => getAuth(app),
      deps: [FIREBASE_APP]
    },
    {
      provide: FIREBASE_FIRESTORE,
      useFactory: (app: FirebaseApp) => getFirestore(app),
      deps: [FIREBASE_APP]
    },
    {
      provide: FIREBASE_STORAGE,
      useFactory: (app: FirebaseApp) => getStorage(app),
      deps: [FIREBASE_APP]
    }
  ];
}

// Configuration validation
export function validateFirebaseConfig(config: FirebaseConfig): string[] {
  const errors: string[] = [];

  if (!config.apiKey) {
    errors.push('apiKey is required');
  }
  if (!config.authDomain) {
    errors.push('authDomain is required');
  }
  if (!config.projectId) {
    errors.push('projectId is required');
  }
  if (!config.storageBucket) {
    errors.push('storageBucket is required');
  }
  if (!config.messagingSenderId) {
    errors.push('messagingSenderId is required');
  }
  if (!config.appId) {
    errors.push('appId is required');
  }

  return errors;
}
