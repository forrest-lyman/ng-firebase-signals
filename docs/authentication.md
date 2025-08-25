# Authentication

The authentication module provides direct, simple functions for Firebase Authentication using Angular signals.

## Quick Start

```typescript
import { provideFirebase } from '@ng-firebase-signals/core';
import { initializeAuth, signInWithGoogle, userState } from '@ng-firebase-signals/core';

// In your app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideFirebase({
      // your Firebase config
    })
  ]
};

// In your component
export class AuthComponent {
  userState = userState;
  
  constructor() {
    // Initialize auth state listener
    initializeAuth();
  }
  
  async login() {
    try {
      await signInWithGoogle();
      // User is now signed in
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  }
}
```

## Functions

### User State Management

#### `userState`
A signal containing the current user state:
```typescript
export const userState = signal<{
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}>({
  currentUser: null,
  isAuthenticated: false,
  isLoading: true
});
```

#### `initializeAuth()`
Initializes the authentication state listener. Call this once in your app to start listening for auth state changes.

### Authentication Functions

#### `signInWithGoogle(): Promise<UserCredential>`
Signs in with Google using popup authentication.

#### `signInWithEmail(email: string, password: string): Promise<UserCredential>`
Signs in with email and password.

#### `createUser(email: string, password: string, displayName?: string): Promise<UserCredential>`
Creates a new user account with email and password. Optionally sets a display name.

#### `signOut(): Promise<void>`
Signs out the current user.

### User Management

#### `updateUserProfile(displayName?: string, photoURL?: string): Promise<void>`
Updates the current user's profile information.

#### `changePassword(newPassword: string): Promise<void>`
Changes the current user's password.

#### `deleteUserAccount(): Promise<void>`
Deletes the current user's account.

### Email Operations

#### `sendEmailVerification(): Promise<void>`
Sends an email verification to the current user.

#### `sendPasswordResetEmail(email: string): Promise<void>`
Sends a password reset email to the specified email address.

#### `confirmPasswordReset(code: string, newPassword: string): Promise<void>`
Confirms a password reset using the code from the reset email.

## Usage Examples

### Basic Authentication Flow

```typescript
export class LoginComponent {
  userState = userState;
  
  constructor() {
    initializeAuth();
  }
  
  async loginWithGoogle() {
    try {
      await signInWithGoogle();
      console.log('Successfully signed in!');
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  }
  
  async loginWithEmail(email: string, password: string) {
    try {
      await signInWithEmail(email, password);
      console.log('Successfully signed in!');
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  }
  
  async logout() {
    try {
      await signOut();
      console.log('Successfully signed out!');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  }
}
```

### User Profile Management

```typescript
export class ProfileComponent {
  userState = userState;
  
  async updateProfile(displayName: string, photoURL?: string) {
    try {
      await updateUserProfile(displayName, photoURL);
      console.log('Profile updated successfully!');
    } catch (error) {
      console.error('Profile update failed:', error);
    }
  }
  
  async changePassword(newPassword: string) {
    try {
      await changePassword(newPassword);
      console.log('Password changed successfully!');
    } catch (error) {
      console.error('Password change failed:', error);
    }
  }
}
```

### Account Management

```typescript
export class AccountComponent {
  async deleteAccount() {
    try {
      await deleteUserAccount();
      console.log('Account deleted successfully!');
    } catch (error) {
      console.error('Account deletion failed:', error);
    }
  }
  
  async sendVerificationEmail() {
    try {
      await sendEmailVerification();
      console.log('Verification email sent!');
    } catch (error) {
      console.error('Failed to send verification email:', error);
    }
  }
}
```

### Password Reset Flow

```typescript
export class PasswordResetComponent {
  async sendResetEmail(email: string) {
    try {
      await sendPasswordResetEmail(email);
      console.log('Password reset email sent!');
    } catch (error) {
      console.error('Failed to send reset email:', error);
    }
  }
  
  async confirmReset(code: string, newPassword: string) {
    try {
      await confirmPasswordReset(code, newPassword);
      console.log('Password reset successful!');
    } catch (error) {
      console.error('Password reset failed:', error);
    }
  }
}
```

## Error Handling

All functions throw errors when they fail. Handle errors using try-catch blocks:

```typescript
try {
  await signInWithGoogle();
} catch (error: any) {
  if (error.code === 'auth/popup-closed-by-user') {
    console.log('User closed the popup');
  } else if (error.code === 'auth/popup-blocked') {
    console.log('Popup was blocked by browser');
  } else {
    console.error('Authentication error:', error.message);
  }
}
```

## State Management

The `userState` signal automatically updates when authentication state changes:

```typescript
// In your template
<div *ngIf="userState().isLoading">Loading...</div>
<div *ngIf="userState().isAuthenticated">
  Welcome, {{ userState().currentUser?.displayName }}!
</div>
<div *ngIf="!userState().isAuthenticated && !userState().isLoading">
  Please sign in
</div>
```

## Best Practices

1. **Call `initializeAuth()` once** in your app initialization
2. **Handle errors appropriately** using try-catch blocks
3. **Check user state** before calling user-specific functions
4. **Use the `userState` signal** for reactive UI updates
5. **Clean up subscriptions** (handled automatically by `DestroyRef`)
