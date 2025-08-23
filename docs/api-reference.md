# API Reference

Complete API documentation for ng-firebase-signals.

## Table of Contents

- [Authentication](#authentication)
- [Firestore](#firestore)
- [Storage](#storage)
- [AI](#ai)
- [App Configuration](#app-configuration)
- [Types](#types)

## Authentication

### `createUserState()`

Creates a reactive user authentication state.

**Returns:**
```typescript
{
  user: Signal<User | null>;
  loading: Signal<boolean>;
  error: Signal<string | null>;
}
```

### `signInWithGoogle()`

Handles Google sign-in authentication.

**Returns:**
```typescript
{
  signIn: () => Promise<void>;
  status: Signal<AuthStatus>;
  error: Signal<string | null>;
}
```

### `signInWithEmail(email: string, password: string)`

Handles email/password sign-in authentication.

**Parameters:**
- `email: string` - User's email address
- `password: string` - User's password

**Returns:**
```typescript
{
  signIn: () => Promise<void>;
  status: Signal<AuthStatus>;
  error: Signal<string | null>;
}
```

### `createUser(email: string, password: string)`

Creates a new user account.

**Parameters:**
- `email: string` - User's email address
- `password: string` - User's password

**Returns:**
```typescript
{
  create: () => Promise<void>;
  status: Signal<AuthStatus>;
  error: Signal<string | null>;
}
```

### `signOut()`

Handles user sign-out.

**Returns:**
```typescript
{
  logout: () => Promise<void>;
  status: Signal<AuthStatus>;
  error: Signal<string | null>;
}
```

### `updateUserProfile(updates: { displayName?: string; photoURL?: string })`

Updates the current user's profile.

**Parameters:**
- `updates: { displayName?: string; photoURL?: string }` - Profile updates

**Returns:**
```typescript
{
  update: () => Promise<void>;
  status: Signal<AuthStatus>;
  error: Signal<string | null>;
}
```

### `changePassword(newPassword: string)`

Changes the current user's password.

**Parameters:**
- `newPassword: string` - New password

**Returns:**
```typescript
{
  change: () => Promise<void>;
  status: Signal<AuthStatus>;
  error: Signal<string | null>;
}
```

### `deleteUserAccount()`

Deletes the current user account.

**Returns:**
```typescript
{
  deleteAccount: () => Promise<void>;
  status: Signal<AuthStatus>;
  error: Signal<string | null>;
}
```

### `sendEmailVerificationEmail()`

Sends an email verification to the current user.

**Returns:**
```typescript
{
  send: () => Promise<void>;
  status: Signal<AuthStatus>;
  error: Signal<string | null>;
}
```

### `sendPasswordResetEmail(email: string)`

Sends a password reset email.

**Parameters:**
- `email: string` - User's email address

**Returns:**
```typescript
{
  send: () => Promise<void>;
  status: Signal<AuthStatus>;
  error: Signal<string | null>;
}
```

### `confirmPasswordReset(oobCode: string, newPassword: string)`

Confirms a password reset.

**Parameters:**
- `oobCode: string` - Password reset code
- `newPassword: string` - New password

**Returns:**
```typescript
{
  confirm: () => Promise<void>;
  status: Signal<AuthStatus>;
  error: Signal<string | null>;
}
```

## Firestore

### `docData<T>(ref: DocumentReference<T>, options?: FirestoreOptions<T>)`

Creates a reactive document data signal.

**Parameters:**
- `ref: DocumentReference<T>` - Document reference to watch
- `options?: FirestoreOptions<T>` - Optional configuration

**Returns:**
```typescript
{
  data: Signal<T | null>;
  status: Signal<FirestoreStatus>;
  error: Signal<string | null>;
  metadata: Signal<{ fromCache: boolean; hasPendingWrites: boolean } | null>;
}
```

### `collectionData<T>(ref: CollectionReference<T> | Query<T>, options?: FirestoreOptions<T>)`

Creates a reactive collection data signal.

**Parameters:**
- `ref: CollectionReference<T> | Query<T>` - Collection reference or query to watch
- `options?: FirestoreOptions<T>` - Optional configuration

**Returns:**
```typescript
{
  data: Signal<T[]>;
  status: Signal<FirestoreStatus>;
  error: Signal<string | null>;
  metadata: Signal<{ fromCache: boolean; hasPendingWrites: boolean } | null>;
}
```

### `createQuery<T>(collectionRef: CollectionReference<T>, ...constraints: QueryConstraint[])`

Creates a query with constraints.

**Parameters:**
- `collectionRef: CollectionReference<T>` - Collection reference
- `...constraints: QueryConstraint[]` - Query constraints

**Returns:**
```typescript
Query<T>
```

### `whereField(field: string, op: '==' | '!=' | '<' | '<=', value: any)`

Creates a where constraint.

**Parameters:**
- `field: string` - Field name
- `op: '==' | '!=' | '<' | '<='` - Comparison operator
- `value: any` - Value to compare against

**Returns:**
```typescript
QueryConstraint
```

### `orderByField(field: string, direction: 'asc' | 'desc' = 'asc')`

Creates an order by constraint.

**Parameters:**
- `field: string` - Field name
- `direction: 'asc' | 'desc'` - Sort direction

**Returns:**
```typescript
QueryConstraint
```

### `limitResults(count: number)`

Creates a limit constraint.

**Parameters:**
- `count: number` - Maximum number of results

**Returns:**
```typescript
QueryConstraint
```

### `startAfterDoc(doc: DocumentSnapshot)`

Creates a start after constraint for pagination.

**Parameters:**
- `doc: DocumentSnapshot` - Document to start after

**Returns:**
```typescript
QueryConstraint
```

### `endBeforeDoc(doc: DocumentSnapshot)`

Creates an end before constraint for pagination.

**Parameters:**
- `doc: DocumentSnapshot` - Document to end before

**Returns:**
```typescript
QueryConstraint
```

### `useDocRef<T>(path: string)`

Creates a document reference.

**Parameters:**
- `path: string` - Document path

**Returns:**
```typescript
DocumentReference<T>
```

### `useCollectionRef<T>(path: string)`

Creates a collection reference.

**Parameters:**
- `path: string` - Collection path

**Returns:**
```typescript
CollectionReference<T>
```

### `useQuery<T>(collectionRef: CollectionReference<T>, ...constraints: QueryConstraint[])`

Creates a query (alias for `createQuery`).

**Parameters:**
- `collectionRef: CollectionReference<T>` - Collection reference
- `...constraints: QueryConstraint[]` - Query constraints

**Returns:**
```typescript
Query<T>
```

## Storage

### `uploadFile(path: string, file: File, options?: UploadOptions)`

Creates a reactive file upload operation.

**Parameters:**
- `path: string` - Storage path
- `file: File` - File to upload
- `options?: UploadOptions` - Optional configuration

**Returns:**
```typescript
{
  data: Signal<StorageFile | null>;
  status: Signal<StorageStatus>;
  error: Signal<string | null>;
  progress: Signal<UploadProgress | null>;
  uploadTask: Signal<UploadTask | null>;
  startUpload: () => void;
  pause: () => void;
  resume: () => void;
  cancel: () => void;
}
```

### `downloadFile(path: string)`

Creates a reactive file download operation.

**Parameters:**
- `path: string` - Storage path

**Returns:**
```typescript
{
  data: Signal<{ url: string; file: StorageFile } | null>;
  status: Signal<StorageStatus>;
  error: Signal<string | null>;
  download: () => Promise<void>;
}
```

### `listFiles(path: string, options?: ListOptions)`

Creates a reactive file listing operation.

**Parameters:**
- `path: string` - Storage path
- `options?: ListOptions` - Optional configuration

**Returns:**
```typescript
{
  data: Signal<{ files: StorageFile[]; folders: string[] }>;
  status: Signal<StorageStatus>;
  error: Signal<string | null>;
  hasMore: Signal<boolean>;
  list: () => Promise<void>;
}
```

### `deleteFile(path: string)`

Creates a reactive file deletion operation.

**Parameters:**
- `path: string` - Storage path

**Returns:**
```typescript
{
  status: Signal<StorageStatus>;
  error: Signal<string | null>;
  deleteFile: () => Promise<void>;
}
```

### `getFileExtension(filename: string): string`

Extracts file extension from filename.

**Parameters:**
- `filename: string` - Filename

**Returns:**
```typescript
string
```

### `formatFileSize(bytes: number): string`

Formats file size in human-readable format.

**Parameters:**
- `bytes: number` - File size in bytes

**Returns:**
```typescript
string
```

## AI

### `generateText(prompt: string, options?: TextGenerationOptions & { model?: SupportedModels })`

Creates a reactive text generation operation.

**Parameters:**
- `prompt: string` - Text prompt
- `options?: TextGenerationOptions & { model?: SupportedModels }` - Optional configuration

**Returns:**
```typescript
{
  data: Signal<AIResponse | null>;
  status: Signal<AIStatus>;
  error: Signal<string | null>;
  generate: () => Promise<void>;
}
```

### `generateTextStream(prompt: string, options?: TextGenerationOptions & { model?: SupportedModels })`

Creates a reactive streaming text generation operation.

**Parameters:**
- `prompt: string` - Text prompt
- `options?: TextGenerationOptions & { model?: SupportedModels }` - Optional configuration

**Returns:**
```typescript
{
  data: Signal<AIResponse | null>;
  status: Signal<AIStatus>;
  error: Signal<string | null>;
  streamData: Signal<string>;
  generate: () => Promise<void>;
}
```

### `createChat(systemPrompt?: string, options?: { model?: SupportedModels })`

Creates a reactive chat session.

**Parameters:**
- `systemPrompt?: string` - Optional system prompt
- `options?: { model?: SupportedModels }` - Optional configuration

**Returns:**
```typescript
{
  messages: Signal<ChatMessage[]>;
  status: Signal<AIStatus>;
  error: Signal<string | null>;
  sendMessage: (content: string) => Promise<void>;
  clearHistory: () => void;
  getConversation: () => ChatMessage[];
}
```

### `generateEmbeddings(texts: string[], options?: EmbeddingOptions)`

Generates embeddings for texts.

**Parameters:**
- `texts: string[]` - Array of text strings
- `options?: EmbeddingOptions` - Optional configuration

**Returns:**
```typescript
Promise<number[][]>
```

### `generateBatch(prompts: string[], options?: TextGenerationOptions & { model?: SupportedModels })`

Generates text for multiple prompts in batch.

**Parameters:**
- `prompts: string[]` - Array of text prompts
- `options?: TextGenerationOptions & { model?: SupportedModels }` - Optional configuration

**Returns:**
```typescript
Promise<AIResponse[]>
```

### `AIUtils`

Pre-built utilities for common AI tasks.

**Methods:**
```typescript
{
  extractKeyInfo: (text: string) => string;
  summarizeText: (text: string, maxLength?: number) => string;
  translateText: (text: string, targetLanguage: string) => string;
  analyzeSentiment: (text: string) => string;
  generateCreative: (prompt: string, style?: string) => string;
  reviewCode: (code: string, language: string) => string;
}
```

### `AIPrompts`

Pre-built prompt templates.

**Categories:**
```typescript
{
  writing: {
    brainstorm: (topic: string) => string;
    outline: (topic: string) => string;
    improve: (text: string) => string;
    expand: (idea: string) => string;
  };
  analysis: {
    compare: (item1: string, item2: string) => string;
    prosCons: (topic: string) => string;
    explain: (concept: string) => string;
  };
  business: {
    marketing: (product: string) => string;
    strategy: (business: string) => string;
    swot: (company: string) => string;
  };
}
```

## App Configuration

### `provideFirebase(config: FirebaseConfig)`

Provides Firebase services for dependency injection.

**Parameters:**
- `config: FirebaseConfig` - Firebase configuration

**Returns:**
```typescript
Provider[]
```

### `validateFirebaseConfig(config: FirebaseConfig): string[]`

Validates Firebase configuration.

**Parameters:**
- `config: FirebaseConfig` - Firebase configuration

**Returns:**
```typescript
string[] // Array of validation errors
```

## Types

### Status Types

```typescript
export type AuthStatus = 'idle' | 'loading' | 'success' | 'error';

export type FirestoreStatus = 'idle' | 'loading' | 'success' | 'error';

export type StorageStatus = 'idle' | 'loading' | 'success' | 'error' | 'paused' | 'cancelled';

export type AIStatus = 'idle' | 'loading' | 'success' | 'error' | 'streaming';
```

### Configuration Types

```typescript
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
```

### Upload Types

```typescript
export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
}

export interface UploadOptions {
  metadata?: {
    contentType?: string;
    customMetadata?: Record<string, string>;
  };
  onProgress?: (progress: UploadProgress) => void;
}

export interface StorageFile {
  name: string;
  fullPath: string;
  size?: number;
  contentType?: string;
  timeCreated?: Date;
  updated?: Date;
  downloadURL?: string;
}
```

### AI Types

```typescript
export interface TextGenerationOptions {
  temperature?: number;
  maxOutputTokens?: number;
  topK?: number;
  topP?: number;
  safetySettings?: SafetySetting[];
}

export interface AIResponse {
  text: string;
  usage?: {
    promptTokens: number;
    responseTokens: number;
    totalTokens: number;
  };
  safetyRatings?: Array<{
    category: string;
    probability: string;
  }>;
}

export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp?: Date;
}

export type SupportedModels = 
  | 'gemini-1.0-pro'
  | 'gemini-1.5-pro'
  | 'gemini-1.5-flash'
  | 'gemini-pro'
  | 'gemini-pro-vision'
  | 'embedding-001'
  | 'text-embedding-004'
  | 'codechat-bison'
  | 'chat-bison'
  // ... and many more
```

### Firestore Types

```typescript
export interface FirestoreOptions<T = DocumentData> {
  includeMetadataChanges?: boolean;
  transform?: (doc: QueryDocumentSnapshot<T>) => any;
}
```

### List Types

```typescript
export interface ListOptions {
  maxResults?: number;
  pageToken?: string;
}
```

## Injection Tokens

```typescript
export const FIREBASE_APP = new InjectionToken<FirebaseApp>('Firebase App');
export const FIREBASE_AUTH = new InjectionToken<Auth>('Firebase Auth');
export const FIREBASE_FIRESTORE = new InjectionToken<Firestore>('Firebase Firestore');
export const FIREBASE_STORAGE = new InjectionToken<FirebaseStorage>('Firebase Storage');
export const GOOGLE_AI = new InjectionToken<GoogleGenerativeAI>('Google AI');
```

## Error Handling

All functions return error signals that contain error messages:

```typescript
// Check for errors
if (function.error()) {
  console.error('Operation failed:', function.error());
}

// Display in template
<div *ngIf="function.error()" class="error">
  {{ function.error() }}
</div>
```

## Status Monitoring

All functions return status signals for monitoring operation state:

```typescript
// Monitor status
effect(() => {
  const status = function.status();
  switch (status) {
    case 'idle':
      console.log('Operation ready');
      break;
    case 'loading':
      console.log('Operation in progress');
      break;
    case 'success':
      console.log('Operation completed');
      break;
    case 'error':
      console.log('Operation failed');
      break;
  }
});
```

## Cleanup

All functions automatically clean up subscriptions when components are destroyed using Angular's `DestroyRef`. No manual cleanup is required.
