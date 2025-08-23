// fx/app.ts
import { signal, inject, DestroyRef, InjectionToken, inject as injectToken } from '@angular/core';
import { initializeApp, FirebaseApp, FirebaseOptions } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface FirebaseConfig extends FirebaseOptions {
  googleAI?: {
    apiKey: string;
    defaultModel?: string;
  };
}

export interface ConfiguredServices {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
  storage: FirebaseStorage;
  googleAI?: GoogleGenerativeAI;
}

// Injection tokens for the configured services
export const FIREBASE_APP = new InjectionToken<FirebaseApp>('Firebase App');
export const FIREBASE_AUTH = new InjectionToken<Auth>('Firebase Auth');
export const FIREBASE_FIRESTORE = new InjectionToken<Firestore>('Firebase Firestore');
export const FIREBASE_STORAGE = new InjectionToken<FirebaseStorage>('Firebase Storage');
export const GOOGLE_AI = new InjectionToken<GoogleGenerativeAI>('Google AI');

// Provider function to configure Firebase
export function provideFirebase(config: FirebaseConfig) {
  return [
    {
      provide: FIREBASE_APP,
      useFactory: () => {
        const app = initializeApp(config);
        return app;
      }
    },
    {
      provide: FIREBASE_AUTH,
      useFactory: () => {
        const app = injectToken(FIREBASE_APP);
        return getAuth(app);
      },
      deps: [FIREBASE_APP]
    },
    {
      provide: FIREBASE_FIRESTORE,
      useFactory: () => {
        const app = injectToken(FIREBASE_APP);
        return getFirestore(app);
      },
      deps: [FIREBASE_APP]
    },
    {
      provide: FIREBASE_STORAGE,
      useFactory: () => {
        const app = injectToken(FIREBASE_APP);
        return getStorage(app);
      },
      deps: [FIREBASE_APP]
    },
    ...(config.googleAI ? [{
      provide: GOOGLE_AI,
      useFactory: () => {
        return new GoogleGenerativeAI(config.googleAI!.apiKey);
      }
    }] : [])
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

  if (config.googleAI && !config.googleAI.apiKey) {
    errors.push('googleAI.apiKey is required when googleAI is provided');
  }

  return errors;
}
