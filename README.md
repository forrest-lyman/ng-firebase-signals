# ng-firebase-signals

A minimal Angular library that provides reactive Firebase utilities using Angular signals. Built for Angular 16+ with support for zoneless signals.

## 🚀 Features

- **Reactive by Design**: Built with Angular signals for reactive UI updates
- **Minimal Framework**: Simple dependency injection with focused, single-purpose functions
- **Type Safe**: Full TypeScript support with proper interfaces
- **Modern Firebase**: Supports Firebase v10+ and Google Generative AI
- **Zoneless Ready**: Works with Angular 18+ zoneless signals
- **Comprehensive**: Covers Auth, Firestore, Storage, and AI

## 📦 Installation

```bash
npm install ng-firebase-signals
```


## 📚 Documentation

### [📖 Getting Started](docs/getting-started.md)
Complete setup guide and configuration options.

### [🔥 Firebase App](docs/firebase-app.md)
Core configuration and dependency injection setup.

### [🔐 Authentication](docs/authentication.md)
User authentication and auth state management.

### [📊 Firestore](docs/firestore.md)
Reactive data binding, queries, and real-time synchronization.

### [💾 Storage](docs/storage.md)
File upload/download with progress tracking and file management.

### [🤖 AI](docs/ai.md)
Google Generative AI integration, text generation, and chat functionality.

### [🎯 Examples](docs/examples.md)
Complete examples and integration patterns.

### [🔍 API Reference](docs/api-reference.md)
Complete API documentation and type definitions.


## ⚡ Quickstart

### 1. Configure Firebase

```typescript
// app.config.ts
import { provideFirebase } from 'ng-firebase-signals';

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id",
  googleAI: {
    apiKey: "your-google-ai-key"
  }
};

export const appConfig = {
  providers: [
    provideFirebase(firebaseConfig)
  ]
};
```

### 2. Use in Components

```typescript
// app.component.ts
import { Component, inject } from '@angular/core';
import { 
  FIREBASE_AUTH,
  FIREBASE_FIRESTORE,
  FIREBASE_STORAGE,
  GOOGLE_AI
} from 'ng-firebase-signals';
import { docData, useDocRef } from 'ng-firebase-signals';
import { uploadFile, generateText } from 'ng-firebase-signals';
import { createUserState, signInWithGoogle } from 'ng-firebase-signals';

@Component({
  selector: 'app-root',
  template: `
    <div>
      <!-- Auth -->
      <div *ngIf="authState.user()">
        <h2>Welcome, {{ authState.user()?.displayName }}</h2>
        <button (click)="signOut()">Sign Out</button>
        
        <!-- User Profile -->
        <div *ngIf="userProfile.data()">
          <h3>Profile: {{ userProfile.data()?.name }}</h3>
        </div>
        
        <!-- File Upload -->
        <input type="file" (change)="onFileSelected($event)">
        <div *ngIf="upload.progress()">
          Upload: {{ upload.progress()?.percentage | number:'1.0-1' }}%
        </div>
        
        <!-- AI Generation -->
        <button (click)="generateStory()">Generate Story</button>
        <div *ngIf="aiGenerator.data()">
          {{ aiGenerator.data()?.text }}
        </div>
      </div>
      
      <div *ngIf="!authState.user()">
        <button (click)="signIn()">Sign In with Google</button>
      </div>
    </div>
  `
})
export class AppComponent {
  // Inject Firebase services directly
  private auth = inject(FIREBASE_AUTH);
  private firestore = inject(FIREBASE_FIRESTORE);
  private storage = inject(FIREBASE_STORAGE);
  private googleAI = inject(GOOGLE_AI, { optional: true });
  
  // Auth state
  authState = createUserState();
  
  // Firestore
  userProfile = docData(useDocRef('users/123'));
  
  // Storage
  upload = uploadFile('uploads/', null);
  
  // AI
  aiGenerator = generateText('', { stream: true });
  
  async signIn() {
    const signIn = signInWithGoogle();
    await signIn.signIn();
  }
  
  async logout() {
    await this.auth.signOut();
  }
  
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.upload = uploadFile(`uploads/${file.name}`, file);
      this.upload.startUpload();
    }
  }
  
  async generateStory() {
    this.aiGenerator = generateText('Write a short story about friendship');
    await this.aiGenerator.generate();
  }
}
```

## 🔧 Core Principles

### Minimal Framework
- **No convenience wrappers**: Everything is injected directly using Angular's dependency injection
- **Focused functions**: Each function does one thing and returns reactive signals
- **Direct service access**: Use `inject(FIREBASE_AUTH)`, `inject(FIREBASE_FIRESTORE)`, etc.
- **Clean separation**: Each utility function handles one specific concern
- **Type safety**: Full TypeScript support with proper interfaces

### Dependency Injection
```typescript
// Inject services directly
const auth = inject(FIREBASE_AUTH);
const firestore = inject(FIREBASE_FIRESTORE);
const storage = inject(FIREBASE_STORAGE);
const googleAI = inject(GOOGLE_AI, { optional: true });

// Use services directly
const user = auth.currentUser;
const usersCollection = collection(firestore, 'users');
const storageRef = ref(storage, 'uploads/');
```

### Focused Functions
```typescript
// Each function does one thing and returns reactive signals
const userProfile = docData(useDocRef('users/123'));
const fileUpload = uploadFile('uploads/file.jpg', file);
const aiGenerator = generateText('Write a story');
const authState = createUserState();
const signIn = signInWithGoogle();

// Access reactive state
if (userProfile.data()) { /* ... */ }
if (fileUpload.progress()) { /* ... */ }
if (aiGenerator.status() === 'success') { /* ... */ }
if (authState.user()) { /* ... */ }
```

### Function Categories

#### **Authentication Functions**
- `createUserState()` - User authentication state
- `signInWithGoogle()` - Google sign in
- `signInWithEmail(email, password)` - Email/password sign in
- `createUser(email, password)` - Create new user
- `signOut()` - Sign out user
- `updateUserProfile(updates)` - Update profile
- `changePassword(newPassword)` - Change password
- `deleteUserAccount()` - Delete account
- `sendEmailVerificationEmail()` - Send verification
- `sendPasswordResetEmail(email)` - Send password reset
- `confirmPasswordReset(code, password)` - Confirm reset

#### **Firestore Functions**
- `docData(ref)` - Document data with real-time updates
- `collectionData(ref)` - Collection data with real-time updates
- `useDocRef(path)` - Get document reference
- `useCollectionRef(path)` - Get collection reference
- `useQuery(collection, ...constraints)` - Build queries
- `createQuery(collection, ...constraints)` - Create queries
- `whereField(field, op, value)` - Where constraints
- `orderByField(field, direction)` - Order by constraints
- `limitResults(count)` - Limit results

#### **Storage Functions**
- `uploadFile(path, file, options)` - File upload with progress
- `downloadFile(path)` - File download
- `listFiles(path, options)` - List files and folders
- `deleteFile(path)` - Delete file
- `getFileExtension(filename)` - Get file extension
- `formatFileSize(bytes)` - Format file size

#### **AI Functions**
- `generateText(prompt, options)` - Text generation
- `generateTextStream(prompt, options)` - Streaming text generation
- `createChat(systemPrompt, options)` - Chat with history
- `generateEmbeddings(texts, options)` - Generate embeddings
- `generateBatch(prompts, options)` - Batch text generation
- `AIUtils` - Pre-built prompt utilities
- `AIPrompts` - Common prompt templates

## 🧪 Testing

```bash
npm test          # Run tests
npm run test:ui   # Run tests with UI
npm run test:coverage  # Run tests with coverage
```

## 🚀 Development

```bash
npm run dev       # Build, link, and watch
npm run build     # Build once
npm run build:watch  # Build in watch mode
```

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
