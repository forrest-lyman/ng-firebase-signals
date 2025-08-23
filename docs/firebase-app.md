# Firebase App

Core configuration, service injection, and app lifecycle management for ng-firebase-signals.

## 🔧 Configuration

### Basic Configuration

```typescript
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

### With Google AI

```typescript
const firebaseConfig = {
  // ... standard Firebase config
  googleAI: {
    apiKey: "your-google-ai-key",
    defaultModel: "gemini-pro" // optional
  }
};
```

### Environment-Specific Configuration

```typescript
// environment.ts
export const environment = {
  production: false,
  firebase: {
    apiKey: "dev-key",
    authDomain: "dev-project.firebaseapp.com",
    projectId: "dev-project",
    storageBucket: "dev-project.appspot.com",
    messagingSenderId: "123",
    appId: "dev-app"
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

## 🚀 Service Injection

### Get All Services

```typescript
import { useFirebase } from 'ng-firebase-signals';

@Component({...})
export class MyComponent {
  const { app, auth, firestore, storage, googleAI } = useFirebase();
  
  // Use individual services
  console.log('Firebase app:', app);
  console.log('Auth service:', auth);
  console.log('Firestore:', firestore);
  console.log('Storage:', storage);
  console.log('Google AI:', googleAI);
}
```

### Get Individual Services

```typescript
import { 
  useAuth, 
  useFirestore, 
  useStorage, 
  useGoogleAI 
} from 'ng-firebase-signals';

@Component({...})
export class MyComponent {
  const auth = useAuth();
  const firestore = useFirestore();
  const storage = useStorage();
  const googleAI = useGoogleAI();
  
  // Use services directly
  const user = auth.currentUser;
  const usersCollection = collection(firestore, 'users');
  const storageRef = ref(storage, 'uploads/');
}
```

### Service Availability

```typescript
import { useGoogleAI } from 'ng-firebase-signals';

@Component({...})
export class MyComponent {
  const googleAI = useGoogleAI();
  
  if (googleAI) {
    // Google AI is configured and available
    const model = googleAI.getGenerativeModel({ model: 'gemini-pro' });
  } else {
    // Google AI is not configured
    console.log('Google AI not available');
  }
}
```

## 📊 App Status & Lifecycle

### App Status

```typescript
import { useAppStatus } from 'ng-firebase-signals';

@Component({...})
export class AppComponent {
  const { status, isReady, hasError, error } = useAppStatus();
  
  // Check app status
  if (status() === 'initializing') {
    console.log('Firebase is initializing...');
  }
  
  if (isReady()) {
    console.log('Firebase is ready!');
  }
  
  if (hasError()) {
    console.error('Firebase error:', error());
  }
}
```

### App Lifecycle

```typescript
import { useAppLifecycle } from 'ng-firebase-signals';

@Component({...})
export class AppComponent {
  const { isInitialized, isDestroyed, markInitialized } = useAppLifecycle();
  
  ngOnInit() {
    // Mark app as initialized when ready
    if (this.appStatus.isReady()) {
      markInitialized();
    }
  }
  
  // Check if app is destroyed
  if (isDestroyed()) {
    console.log('App is being destroyed');
  }
}
```

### Complete App Component

```typescript
import { Component, OnInit } from '@angular/core';
import { 
  useAppStatus, 
  useAppLifecycle, 
  useAuthState 
} from 'ng-firebase-signals';

@Component({
  selector: 'app-root',
  template: `
    <div>
      <!-- Loading State -->
      <div *ngIf="appStatus.status() === 'initializing'" class="loading">
        <div class="spinner"></div>
        <p>Initializing Firebase...</p>
      </div>
      
      <!-- Error State -->
      <div *ngIf="appStatus.hasError()" class="error">
        <h2>Firebase Error</h2>
        <p>{{ appStatus.error() }}</p>
        <button (click)="retry()">Retry</button>
      </div>
      
      <!-- Ready State -->
      <div *ngIf="appStatus.isReady()" class="app">
        <ng-container *ngIf="!authState.loading()">
          <!-- Your app content here -->
          <router-outlet></router-outlet>
        </ng-container>
      </div>
    </div>
  `
})
export class AppComponent implements OnInit {
  appStatus = useAppStatus();
  appLifecycle = useAppLifecycle();
  authState = useAuthState();
  
  ngOnInit() {
    // Wait for Firebase to be ready
    if (this.appStatus.isReady()) {
      this.appLifecycle.markInitialized();
    }
  }
  
  retry() {
    // Reload the app to retry Firebase initialization
    window.location.reload();
  }
}
```

## ✅ Configuration Validation

### Validate Configuration

```typescript
import { validateFirebaseConfig } from 'ng-firebase-signals';

const firebaseConfig = {
  apiKey: "your-key",
  authDomain: "your-domain",
  projectId: "your-project",
  storageBucket: "your-bucket",
  messagingSenderId: "123",
  appId: "your-app"
};

const errors = validateFirebaseConfig(firebaseConfig);

if (errors.length > 0) {
  console.error('Firebase configuration errors:');
  errors.forEach(error => console.error(`- ${error}`));
} else {
  console.log('Firebase configuration is valid');
}
```

### Required Fields

The following fields are required in your Firebase configuration:

- `apiKey` - Your Firebase API key
- `authDomain` - Your Firebase auth domain
- `projectId` - Your Firebase project ID
- `storageBucket` - Your Firebase storage bucket
- `messagingSenderId` - Your Firebase messaging sender ID
- `appId` - Your Firebase app ID

### Optional Fields

- `measurementId` - Google Analytics measurement ID
- `databaseURL` - Realtime Database URL (if using)
- `googleAI` - Google AI configuration object

## 🌍 Environment Detection

### Detect Environment

```typescript
import { detectEnvironment } from 'ng-firebase-signals';

@Component({...})
export class AppComponent {
  const environment = detectEnvironment();
  
  if (environment === 'development') {
    console.log('Running in development mode');
  } else if (environment === 'production') {
    console.log('Running in production mode');
  } else if (environment === 'test') {
    console.log('Running in test mode');
  }
}
```

### Environment-Specific Behavior

```typescript
import { detectEnvironment } from 'ng-firebase-signals';

@Component({...})
export class AppComponent {
  const environment = detectEnvironment();
  
  // Enable debug logging in development
  if (environment === 'development') {
    console.log('Debug mode enabled');
    // Enable Firebase debug logging
    // firebase.setLogLevel('debug');
  }
  
  // Use different configurations based on environment
  const config = environment === 'production' 
    ? productionConfig 
    : developmentConfig;
}
```

## 🔧 Advanced Configuration

### Custom Provider Configuration

```typescript
import { provideFirebase } from 'ng-firebase-signals';

export const appConfig = {
  providers: [
    // Firebase configuration
    provideFirebase(firebaseConfig),
    
    // Additional providers
    provideRouter(routes),
    provideAnimations(),
    
    // Custom providers
    {
      provide: 'API_BASE_URL',
      useValue: environment.apiUrl
    }
  ]
};
```

### Multiple Firebase Apps

```typescript
// For multiple Firebase projects
const primaryConfig = {
  apiKey: "primary-key",
  projectId: "primary-project",
  // ... other config
};

const secondaryConfig = {
  apiKey: "secondary-key",
  projectId: "secondary-project",
  // ... other config
};

export const appConfig = {
  providers: [
    provideFirebase(primaryConfig, 'primary'),
    provideFirebase(secondaryConfig, 'secondary')
  ]
};
```

## 🧪 Testing

### Test Configuration

```typescript
// test-setup.ts
import { TestBed } from '@angular/core/testing';
import { provideFirebase } from 'ng-firebase-signals';

const testConfig = {
  apiKey: "test-key",
  authDomain: "test.firebaseapp.com",
  projectId: "test-project",
  storageBucket: "test.appspot.com",
  messagingSenderId: "123",
  appId: "test-app"
};

TestBed.configureTestingModule({
  providers: [
    provideFirebase(testConfig)
  ]
});
```

### Mock Services

```typescript
// For testing without Firebase
const mockFirebaseConfig = {
  apiKey: "mock-key",
  authDomain: "mock.firebaseapp.com",
  projectId: "mock-project",
  storageBucket: "mock.appspot.com",
  messagingSenderId: "123",
  appId: "mock-app"
};

// In your test
TestBed.configureTestingModule({
  providers: [
    provideFirebase(mockFirebaseConfig)
  ]
});
```

## 🚨 Troubleshooting

### Common Issues

#### Firebase Not Initializing

**Problem**: Firebase services are not available.

**Solution**: Check that `provideFirebase()` is included in your app providers.

#### Configuration Errors

**Problem**: "Invalid Firebase configuration" errors.

**Solution**: Use `validateFirebaseConfig()` to check your configuration.

#### Service Injection Errors

**Problem**: "No provider for FIREBASE_AUTH" errors.

**Solution**: Ensure `provideFirebase()` is called before using any Firebase services.

#### Google AI Not Available

**Problem**: `useGoogleAI()` returns `null`.

**Solution**: Add `googleAI.apiKey` to your Firebase configuration.

### Debug Mode

```typescript
// Enable debug logging
if (detectEnvironment() === 'development') {
  console.log('Firebase config:', firebaseConfig);
  console.log('App status:', appStatus.status());
  console.log('Services available:', {
    auth: !!useAuth(),
    firestore: !!useFirestore(),
    storage: !!useStorage(),
    googleAI: !!useGoogleAI()
  });
}
```

## 📚 Next Steps

- [Authentication](authentication.md) - User management and auth state
- [Firestore](firestore.md) - Database operations and real-time data
- [Storage](storage.md) - File management and uploads
- [AI](ai.md) - Google AI integration and text generation
- [Examples](examples.md) - Complete integration patterns
