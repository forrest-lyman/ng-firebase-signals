# ng-firebase-signals

A minimal Angular library that provides reactive Firebase utilities using Angular signals.

## Quick Start

```typescript
import { provideFirebase } from '@ng-firebase-signals/core';
import { initializeAuth, signInWithGoogle, userState } from '@ng-firebase-signals/core';

// In your app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideFirebase({
      apiKey: 'your-api-key',
      authDomain: 'your-project.firebaseapp.com',
      projectId: 'your-project-id',
      storageBucket: 'your-project.appspot.com',
      messagingSenderId: '123456789',
      appId: 'your-app-id',
      googleAI: {
        apiKey: 'your-google-ai-key'
      }
    })
  ]
};

// In your component
export class AppComponent {
  userState = userState;
  
  constructor() {
    initializeAuth();
  }
  
  async login() {
    try {
      await signInWithGoogle();
      console.log('User signed in!');
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  }
}
```

## Table of Contents

### [Getting Started](docs/getting-started.md)
Complete setup and installation guide

### [Firebase App Configuration](docs/firebase-app.md)
Core Firebase configuration and service injection

### [Authentication](docs/authentication.md)
User authentication with Firebase Auth

### [Firestore](docs/firestore.md)
Real-time database operations with Firestore

### [Storage](docs/storage.md)
File upload, download, and management with Firebase Storage

### [AI](docs/ai.md)
Google Generative AI integration for text generation and chat

### [Examples](docs/examples.md)
Practical examples and integration patterns

### [API Reference](docs/api-reference.md)
Complete API documentation for all functions and types

## Features

- **Minimal & Focused**: Direct, single-purpose functions
- **Angular Signals**: Reactive state management with Angular signals
- **TypeScript**: Full type safety and IntelliSense support
- **Firebase Integration**: Auth, Firestore, Storage, and Google AI
- **Zero Dependencies**: Only Angular core and Firebase as peer dependencies
- **Tree Shakeable**: Only import what you use

## Installation

```bash
npm install @ng-firebase-signals/core
```

## Peer Dependencies

```json
{
  "@angular/common": "^16.0.0",
  "@angular/core": "^16.0.0",
  "firebase": "^10.0.0",
  "@google/generative-ai": "^0.20.0"
}
```

## License

MIT License - see [LICENSE](LICENSE) for details.
