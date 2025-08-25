# Firebase App Configuration

The Firebase App module provides core configuration and service injection for Firebase and Google AI services.

## Overview

This module handles the initialization and configuration of Firebase services and provides them through Angular's dependency injection system. It's the foundation that all other modules depend on.

## Configuration

### Basic Setup

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideFirebase } from '@ng-firebase-signals/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideFirebase({
      apiKey: 'your-api-key',
      authDomain: 'your-project.firebaseapp.com',
      projectId: 'your-project-id',
      storageBucket: 'your-project.appspot.com',
      messagingSenderId: '123456789',
      appId: 'your-app-id'
    })
  ]
};
```

### With Google AI

```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideFirebase({
      // Firebase configuration
      apiKey: 'your-api-key',
      authDomain: 'your-project.firebaseapp.com',
      projectId: 'your-project-id',
      storageBucket: 'your-project.appspot.com',
      messagingSenderId: '123456789',
      appId: 'your-app-id',
      
      // Google AI configuration
      googleAI: {
        apiKey: 'your-google-ai-key'
      }
    })
  ]
};
```

## Types

### FirebaseConfig

```typescript
export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
  databaseURL?: string;
  googleAI?: {
    apiKey: string;
  };
}
```

### ConfiguredServices

```typescript
export interface ConfiguredServices {
  auth: Auth;
  firestore: Firestore;
  storage: FirebaseStorage;
  googleAI?: GoogleGenerativeAI;
}
```

## Injection Tokens

The module provides several injection tokens for accessing Firebase services:

### FIREBASE_AUTH
Firebase Authentication service.

```typescript
import { inject } from '@angular/core';
import { FIREBASE_AUTH } from '@ng-firebase-signals/core';

export class AuthComponent {
  private auth = inject(FIREBASE_AUTH);
  
  getCurrentUser() {
    return this.auth.currentUser;
  }
}
```

### FIREBASE_FIRESTORE
Firebase Firestore service.

```typescript
import { inject } from '@angular/core';
import { FIREBASE_FIRESTORE } from '@ng-firebase-signals/core';

export class FirestoreComponent {
  private firestore = inject(FIREBASE_FIRESTORE);
  
  getCollection() {
    return collection(this.firestore, 'users');
  }
}
```

### FIREBASE_STORAGE
Firebase Storage service.

```typescript
import { inject } from '@angular/core';
import { FIREBASE_STORAGE } from '@ng-firebase-signals/core';

export class StorageComponent {
  private storage = inject(FIREBASE_STORAGE);
  
  getStorageRef() {
    return ref(this.storage, 'uploads/');
  }
}
```

### GOOGLE_AI
Google Generative AI service (optional).

```typescript
import { inject } from '@angular/core';
import { GOOGLE_AI } from '@ng-firebase-signals/core';

export class AIComponent {
  private googleAI = inject(GOOGLE_AI, { optional: true });
  
  async generateText() {
    if (this.googleAI) {
      const model = this.googleAI.getGenerativeModel({ model: 'gemini-pro' });
      return await model.generateContent('Hello, world!');
    }
  }
}
```

## Environment Configuration

For better security and environment management, use environment files:

### environment.ts
```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: 'dev-api-key',
    authDomain: 'dev-project.firebaseapp.com',
    projectId: 'dev-project-id',
    storageBucket: 'dev-project.appspot.com',
    messagingSenderId: '123456789',
    appId: 'dev-app-id'
  },
  googleAI: {
    apiKey: 'dev-google-ai-key'
  }
};
```

### environment.prod.ts
```typescript
export const environment = {
  production: true,
  firebase: {
    apiKey: 'prod-api-key',
    authDomain: 'prod-project.firebaseapp.com',
    projectId: 'prod-project-id',
    storageBucket: 'prod-project.appspot.com',
    messagingSenderId: '123456789',
    appId: 'prod-app-id'
  },
  googleAI: {
    apiKey: 'prod-google-ai-key'
  }
};
```

### app.config.ts
```typescript
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideFirebase({
      ...environment.firebase,
      googleAI: environment.googleAI
    })
  ]
};
```

## Error Handling

The module provides graceful error handling for missing configurations:

```typescript
// Google AI is optional - inject with { optional: true }
const googleAI = inject(GOOGLE_AI, { optional: true });

if (!googleAI) {
  console.warn('Google AI not configured');
  // Handle missing configuration
}
```

## Best Practices

1. **Environment Variables**: Use environment files for different configurations
2. **Security**: Never commit API keys to version control
3. **Optional Services**: Use `{ optional: true }` for services that might not be configured
4. **Error Handling**: Always check if services are available before using them
5. **Type Safety**: Use the provided types for better development experience

## Troubleshooting

### Common Issues

**"Firebase not configured" error**
- Ensure you've called `provideFirebase()` in your app configuration
- Check that your Firebase config object is correct
- Verify all required fields are present

**"Google AI not configured" error**
- Make sure you've provided the `googleAI.apiKey` in your configuration
- Use `{ optional: true }` when injecting `GOOGLE_AI` if it's not required
- Verify your Google AI API key is valid

**Service injection errors**
- Ensure you're importing the correct injection tokens
- Check that the services are properly configured in your Firebase project
- Verify your Firebase project has the required services enabled
