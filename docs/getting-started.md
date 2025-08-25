# Getting Started

This guide will help you set up and configure ng-firebase-signals in your Angular application.

## Prerequisites

- Angular 16+ application
- Firebase project with Auth, Firestore, and/or Storage enabled
- Google AI API key (optional, for AI features)

## Installation

Install the library using npm:

```bash
npm install @ng-firebase-signals/core
```

## Configuration

### 1. Firebase Setup

First, create a Firebase project and get your configuration:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Go to Project Settings > General
4. Scroll down to "Your apps" and click "Add app" > Web
5. Copy the configuration object

### 2. Google AI Setup (Optional)

For AI features, you'll need a Google AI API key:

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the API key

### 3. Angular Configuration

Update your `app.config.ts` to include the Firebase provider:

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideFirebase } from '@ng-firebase-signals/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideFirebase({
      // Firebase config
      apiKey: 'your-api-key',
      authDomain: 'your-project.firebaseapp.com',
      projectId: 'your-project-id',
      storageBucket: 'your-project.appspot.com',
      messagingSenderId: '123456789',
      appId: 'your-app-id',
      
      // Google AI config (optional)
      googleAI: {
        apiKey: 'your-google-ai-key'
      }
    })
  ]
};
```

### 4. Environment Configuration

For better security, use environment variables:

```typescript
// environment.ts
export const environment = {
  production: false,
  firebase: {
    apiKey: 'your-api-key',
    authDomain: 'your-project.firebaseapp.com',
    projectId: 'your-project-id',
    storageBucket: 'your-project.appspot.com',
    messagingSenderId: '123456789',
    appId: 'your-app-id'
  },
  googleAI: {
    apiKey: 'your-google-ai-key'
  }
};

// app.config.ts
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

## Basic Usage

### Authentication

```typescript
import { Component } from '@angular/core';
import { initializeAuth, signInWithGoogle, userState } from '@ng-firebase-signals/core';

@Component({
  selector: 'app-root',
  template: `
    <div *ngIf="userState().isAuthenticated">
      Welcome, {{ userState().currentUser?.displayName }}!
      <button (click)="logout()">Sign Out</button>
    </div>
    
    <div *ngIf="!userState().isAuthenticated">
      <button (click)="login()">Sign In with Google</button>
    </div>
  `
})
export class AppComponent {
  userState = userState;
  
  constructor() {
    initializeAuth();
  }
  
  async login() {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  }
  
  async logout() {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  }
}
```

### Firestore

```typescript
import { Component, inject, DestroyRef } from '@angular/core';
import { docData, collectionData } from '@ng-firebase-signals/core';

@Component({
  selector: 'app-users',
  template: `
    <div *ngFor="let user of users()">
      {{ user.name }} - {{ user.email }}
    </div>
  `
})
export class UsersComponent {
  destroyRef = inject(DestroyRef);
  
  users = collectionData('users', { destroyRef: this.destroyRef });
  
  userProfile = docData('users/123', { destroyRef: this.destroyRef });
}
```

### Storage

```typescript
import { Component } from '@angular/core';
import { uploadFile } from '@ng-firebase-signals/core';

@Component({
  selector: 'app-upload',
  template: `
    <input type="file" (change)="onFileSelected($event)">
    <div *ngIf="uploadProgress() > 0">
      Upload Progress: {{ uploadProgress() }}%
    </div>
  `
})
export class UploadComponent {
  uploadData = uploadFile('uploads/');
  
  get uploadProgress() { return this.uploadData.progress; }
  
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.uploadData.upload(file);
    }
  }
}
```

### AI

```typescript
import { Component } from '@angular/core';
import { generateText } from '@ng-firebase-signals/core';

@Component({
  selector: 'app-ai',
  template: `
    <button (click)="generateStory()">Generate Story</button>
    <div *ngIf="story">{{ story }}</div>
  `
})
export class AIComponent {
  story = '';
  
  async generateStory() {
    try {
      const response = await generateText('Write a short story about friendship');
      this.story = response.text;
    } catch (error) {
      console.error('Generation failed:', error);
    }
  }
}
```

## Next Steps

- Read the [Firebase App Configuration](firebase-app.md) guide for detailed setup
- Explore [Authentication](authentication.md) for user management
- Learn about [Firestore](firestore.md) for database operations
- Check out [Storage](storage.md) for file management
- Try [AI](ai.md) features for text generation
- See [Examples](examples.md) for complete integration patterns
- Reference the [API Reference](api-reference.md) for all available functions

## Troubleshooting

### Common Issues

**"Google AI not configured" error**
- Make sure you've provided the `googleAI.apiKey` in your Firebase configuration
- Verify your API key is valid and has the necessary permissions

**"Firebase not configured" error**
- Ensure you've called `provideFirebase()` in your app configuration
- Check that your Firebase config object is correct

**Authentication not working**
- Verify your Firebase project has Authentication enabled
- Check that you've configured the correct sign-in providers

**Firestore permission errors**
- Set up proper Firestore security rules
- Ensure your authentication is working correctly

**Storage upload failures**
- Check Firebase Storage security rules
- Verify your Firebase project has Storage enabled

## Support

If you encounter issues:

1. Check the [API Reference](api-reference.md) for function documentation
2. Review the [Examples](examples.md) for usage patterns
3. Ensure your Firebase configuration is correct
4. Check the browser console for detailed error messages
