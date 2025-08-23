# Getting Started

Complete setup guide and configuration options for ng-firebase-signals.

## 📦 Installation

```bash
npm install ng-firebase-signals
```

## 🔧 Setup

### 1. Firebase Configuration

First, you'll need a Firebase project. If you don't have one:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Add a web app to your project
4. Copy the configuration object

### 2. Configure Your App

```typescript
// app.config.ts
import { provideFirebase } from 'ng-firebase-signals';

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

export const appConfig = {
  providers: [
    provideFirebase(firebaseConfig)
  ]
};
```

### 3. Bootstrap Your App

```typescript
// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig);
```

## 🌟 Google AI Integration (Optional)

To use the AI utilities, add Google AI configuration:

```typescript
const firebaseConfig = {
  // ... standard Firebase config
  googleAI: {
    apiKey: "your-google-ai-api-key",
    defaultModel: "gemini-pro" // optional, defaults to gemini-pro
  }
};
```

To get a Google AI API key:

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your Firebase configuration

## 🔐 Enable Firebase Services

### Authentication

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable the providers you want to use (Google, Email/Password, etc.)
3. For Google Auth, add your authorized domains

### Firestore

1. Go to **Firestore Database** → **Create database**
2. Choose your security rules (start in test mode for development)
3. Select a location for your database

### Storage

1. Go to **Storage** → **Get started**
2. Choose your security rules (start in test mode for development)
3. Select a location for your storage

## 🚀 First Steps

### 1. Basic Component Setup

```typescript
// app.component.ts
import { Component } from '@angular/core';
import { useAuthState } from 'ng-firebase-signals';

@Component({
  selector: 'app-root',
  template: `
    <div>
      <div *ngIf="authState.loading()">Loading...</div>
      
      <div *ngIf="authState.user()">
        <h2>Welcome, {{ authState.user()?.displayName }}</h2>
        <p>You are logged in!</p>
      </div>
      
      <div *ngIf="!authState.user()">
        <p>Please sign in to continue</p>
      </div>
    </div>
  `
})
export class AppComponent {
  authState = useAuthState();
}
```

### 2. Add Authentication

```typescript
import { useSignIn, useSignOut } from 'ng-firebase-signals';

export class AppComponent {
  authState = useAuthState();
  signIn = useSignIn();
  signOut = useSignOut();
  
  async login() {
    await this.signIn.google();
  }
  
  async logout() {
    await this.signOut();
  }
}
```

### 3. Add Firestore Data

```typescript
import { docData, useDocRef } from 'ng-firebase-signals';

export class AppComponent {
  // ... existing code ...
  
  userProfile = docData(useDocRef('users/123'));
  
  // In template:
  // <div *ngIf="userProfile.data()">
  //   <h3>Profile: {{ userProfile.data()?.name }}</h3>
  // </div>
}
```

## ⚙️ Configuration Options

### Firebase App Configuration

```typescript
const firebaseConfig = {
  // Required fields
  apiKey: string,
  authDomain: string,
  projectId: string,
  storageBucket: string,
  messagingSenderId: string,
  appId: string,
  
  // Optional fields
  measurementId?: string,
  databaseURL?: string,
  
  // Google AI configuration
  googleAI?: {
    apiKey: string,
    defaultModel?: string
  }
};
```

### Environment-Specific Configuration

```typescript
// environment.ts
export const environment = {
  production: false,
  firebase: {
    apiKey: "dev-api-key",
    authDomain: "dev-project.firebaseapp.com",
    // ... other config
  }
};

// environment.prod.ts
export const environment = {
  production: true,
  firebase: {
    apiKey: "prod-api-key",
    authDomain: "prod-project.firebaseapp.com",
    // ... other config
  }
};

// app.config.ts
import { environment } from '../environments/environment';

export const appConfig = {
  providers: [
    provideFirebase(environment.firebase)
  ]
};
```

## 🔒 Security Rules

### Firestore Security Rules

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow public read access to public collections
    match /public/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### Storage Security Rules

```javascript
// storage.rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to upload files
    match /uploads/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow public read access to public files
    match /public/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 🧪 Testing Your Setup

### 1. Check Console for Errors

Open your browser's developer console and look for any Firebase-related errors.

### 2. Verify Authentication

Try signing in with Google or email/password to verify authentication is working.

### 3. Test Firestore

Create a test document in Firestore and try to read it in your app.

### 4. Test Storage

Try uploading a small test file to verify storage is working.

## 🚨 Common Issues

### Firebase Not Initialized

**Error**: "Firebase: Error (auth/invalid-api-key)."

**Solution**: Check that your Firebase configuration is correct and the API key is valid.

### CORS Issues

**Error**: "Cross-origin request blocked."

**Solution**: Add your domain to Firebase Console → Authentication → Settings → Authorized domains.

### Permission Denied

**Error**: "Permission denied" when reading/writing data.

**Solution**: Check your Firestore and Storage security rules.

### Google AI Not Working

**Error**: "Google AI not configured."

**Solution**: Make sure you've added the `googleAI.apiKey` to your Firebase configuration.

## 📱 Next Steps

Now that you have the basics set up, explore the other documentation sections:

- [Firebase App](firebase-app.md) - Advanced configuration and lifecycle management
- [Authentication](authentication.md) - User management and auth state
- [Firestore](firestore.md) - Database operations and real-time data
- [Storage](storage.md) - File management and uploads
- [AI](ai.md) - Google AI integration and text generation

## 🆘 Need Help?

- Check the [API Reference](api-reference.md) for detailed function documentation
- Look at [Examples](examples.md) for complete integration patterns
- Open an issue on GitHub if you encounter bugs
- Check the [Firebase documentation](https://firebase.google.com/docs) for general Firebase help
