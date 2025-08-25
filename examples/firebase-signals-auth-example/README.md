# Firebase Signals Auth Example

This is a minimal example demonstrating how to use the `ng-firebase-signals` library for Firebase Authentication with Angular signals.

## Features

- Google Sign-In
- Email/Password Authentication
- User Registration
- Real-time user state management
- Clean, responsive UI

## Setup

1. **Configure Firebase**
   
   Update the Firebase configuration in `src/app/app.config.ts` with your actual Firebase project settings:

   ```typescript
   provideFirebase({
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "your-sender-id",
     appId: "your-app-id"
   })
   ```

2. **Enable Authentication Methods**
   
   In your Firebase Console:
   - Go to Authentication > Sign-in method
   - Enable Google Sign-in
   - Enable Email/Password authentication

3. **Run the Example**
   
   ```bash
   npm start
   ```

## How It Works

The example demonstrates the core authentication functions from `ng-firebase-signals`:

### User State Management
- `userState` signal provides real-time authentication state
- `initializeAuth()` starts listening for auth state changes

### Authentication Functions
- `signInWithGoogle()` - Google popup authentication
- `signInWithEmail()` - Email/password sign in
- `createUser()` - User registration
- `signOut()` - Sign out current user

### Reactive UI
The UI automatically updates based on the `userState` signal:
- Shows loading state while checking authentication
- Displays user information when authenticated
- Shows login/signup forms when not authenticated

## Key Implementation Details

1. **Signal-based State**: Uses Angular signals for reactive state management
2. **Error Handling**: All auth functions include try-catch error handling
3. **Form Management**: Uses signals for form state management
4. **Clean Architecture**: Minimal, focused functions without complex abstractions

## Library Integration

This example shows how to integrate `ng-firebase-signals` into an Angular application:

1. Import and configure Firebase in `app.config.ts`
2. Import authentication functions in your components
3. Use the `userState` signal for reactive UI updates
4. Call authentication functions as needed

The library provides a minimal, direct approach to Firebase authentication without complex abstractions or convenience hooks.
