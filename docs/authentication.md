# Authentication

The authentication module provides reactive user authentication state and authentication operations using Angular signals.

## Overview

Each authentication function is focused and does one specific thing, returning reactive signals for state management. This approach is more Angular-like and easier to compose.

## Core Functions

### User State Management

#### `createUserState()`

Creates a reactive user authentication state that automatically updates when the user signs in or out.

```typescript
import { createUserState } from 'ng-firebase-signals';

@Component({...})
export class AuthComponent {
  authState = createUserState();
  
  // Access reactive state
  user = this.authState.user;
  loading = this.authState.loading;
  error = this.authState.error;
}
```

**Returns:**
- `user` - Signal containing the current user or null
- `loading` - Signal indicating if auth state is being determined
- `error` - Signal containing any authentication errors

**Template Usage:**
```html
<div *ngIf="authState.user()">
  <h2>Welcome, {{ authState.user()?.displayName }}</h2>
</div>

<div *ngIf="authState.loading()">
  Loading...
</div>

<div *ngIf="authState.error()">
  Error: {{ authState.error() }}
</div>
```

## Authentication Operations

### Sign In Functions

#### `signInWithGoogle()`

Handles Google sign-in authentication.

```typescript
import { signInWithGoogle } from 'ng-firebase-signals';

@Component({...})
export class SignInComponent {
  googleSignIn = signInWithGoogle();
  
  async handleGoogleSignIn() {
    await this.googleSignIn.signIn();
  }
}
```

**Returns:**
- `signIn()` - Function to trigger Google sign-in
- `status` - Signal with current operation status
- `error` - Signal containing any errors

**Template Usage:**
```html
<button 
  (click)="handleGoogleSignIn()"
  [disabled]="googleSignIn.status() === 'loading'">
  {{ googleSignIn.status() === 'loading' ? 'Signing In...' : 'Sign In with Google' }}
</button>

<div *ngIf="googleSignIn.error()">
  Error: {{ googleSignIn.error() }}
</div>
```

#### `signInWithEmail(email: string, password: string)`

Handles email/password sign-in authentication.

```typescript
import { signInWithEmail } from 'ng-firebase-signals';

@Component({...})
export class SignInComponent {
  emailSignIn = signInWithEmail('user@example.com', 'password123');
  
  async handleEmailSignIn() {
    await this.emailSignIn.signIn();
  }
}
```

**Returns:**
- `signIn()` - Function to trigger email sign-in
- `status` - Signal with current operation status
- `error` - Signal containing any errors

### User Creation

#### `createUser(email: string, password: string)`

Creates a new user account with email and password.

```typescript
import { createUser } from 'ng-firebase-signals';

@Component({...})
export class SignUpComponent {
  userCreation = createUser('newuser@example.com', 'password123');
  
  async handleSignUp() {
    await this.userCreation.create();
  }
}
```

**Returns:**
- `create()` - Function to create the user account
- `status` - Signal with current operation status
- `error` - Signal containing any errors

### Sign Out

#### `signOut()`

Handles user sign-out.

```typescript
import { signOut } from 'ng-firebase-signals';

@Component({...})
export class UserProfileComponent {
  signOutAction = signOut();
  
  async handleSignOut() {
    await this.signOutAction.logout();
  }
}
```

**Returns:**
- `logout()` - Function to sign out the user
- `status` - Signal with current operation status
- `error` - Signal containing any errors

## User Management

### Profile Updates

#### `updateUserProfile(updates: { displayName?: string; photoURL?: string })`

Updates the current user's profile information.

```typescript
import { updateUserProfile } from 'ng-firebase-signals';

@Component({...})
export class ProfileComponent {
  profileUpdate = updateUserProfile({
    displayName: 'John Doe',
    photoURL: 'https://example.com/photo.jpg'
  });
  
  async handleProfileUpdate() {
    await this.profileUpdate.update();
  }
}
```

**Returns:**
- `update()` - Function to update the profile
- `status` - Signal with current operation status
- `error` - Signal containing any errors

### Password Management

#### `changePassword(newPassword: string)`

Changes the current user's password.

```typescript
import { changePassword } from 'ng-firebase-signals';

@Component({...})
export class SecurityComponent {
  passwordChange = changePassword('newSecurePassword123');
  
  async handlePasswordChange() {
    await this.passwordChange.change();
  }
}
```

**Returns:**
- `change()` - Function to change the password
- `status` - Signal with current operation status
- `error` - Signal containing any errors

### Account Deletion

#### `deleteUserAccount()`

Deletes the current user account.

```typescript
import { deleteUserAccount } from 'ng-firebase-signals';

@Component({...})
export class AccountComponent {
  accountDeletion = deleteUserAccount();
  
  async handleAccountDeletion() {
    await this.accountDeletion.deleteAccount();
  }
}
```

**Returns:**
- `deleteAccount()` - Function to delete the account
- `status` - Signal with current operation status
- `error` - Signal containing any errors

## Email Operations

### Email Verification

#### `sendEmailVerificationEmail()`

Sends an email verification to the current user.

```typescript
import { sendEmailVerificationEmail } from 'ng-firebase-signals';

@Component({...})
export class VerificationComponent {
  emailVerification = sendEmailVerificationEmail();
  
  async handleEmailVerification() {
    await this.emailVerification.send();
  }
}
```

**Returns:**
- `send()` - Function to send verification email
- `status` - Signal with current operation status
- `error` - Signal containing any errors

### Password Reset

#### `sendPasswordResetEmail(email: string)`

Sends a password reset email to the specified email address.

```typescript
import { sendPasswordResetEmail } from 'ng-firebase-signals';

@Component({...})
export class PasswordResetComponent {
  passwordReset = sendPasswordResetEmail('user@example.com');
  
  async handlePasswordReset() {
    await this.passwordReset.send();
  }
}
```

**Returns:**
- `send()` - Function to send password reset email
- `status` - Signal with current operation status
- `error` - Signal containing any errors

#### `confirmPasswordReset(oobCode: string, newPassword: string)`

Confirms a password reset with the provided code and new password.

```typescript
import { confirmPasswordReset } from 'ng-firebase-signals';

@Component({...})
export class PasswordResetConfirmComponent {
  passwordResetConfirm = confirmPasswordReset('reset-code-123', 'newPassword123');
  
  async handlePasswordResetConfirm() {
    await this.passwordResetConfirm.confirm();
  }
}
```

**Returns:**
- `confirm()` - Function to confirm password reset
- `status` - Signal with current operation status
- `error` - Signal containing any errors

## Status Types

All authentication functions return a consistent status pattern:

```typescript
export type AuthStatus = 'idle' | 'loading' | 'success' | 'error';
```

- `idle` - Operation hasn't started
- `loading` - Operation in progress
- `success` - Operation completed successfully
- `error` - Operation failed with an error

## Complete Example

```typescript
import { Component, inject } from '@angular/core';
import { 
  createUserState, 
  signInWithGoogle, 
  signOut,
  updateUserProfile 
} from 'ng-firebase-signals';

@Component({
  selector: 'app-auth',
  template: `
    <div *ngIf="authState.user(); else signInForm">
      <h2>Welcome, {{ authState.user()?.displayName }}</h2>
      
      <div *ngIf="profileUpdate.status() === 'success'">
        Profile updated successfully!
      </div>
      
      <button (click)="updateProfile()">Update Profile</button>
      <button (click)="handleSignOut()">Sign Out</button>
    </div>
    
    <ng-template #signInForm>
      <button 
        (click)="handleGoogleSignIn()"
        [disabled]="googleSignIn.status() === 'loading'">
        {{ googleSignIn.status() === 'loading' ? 'Signing In...' : 'Sign In with Google' }}
      </button>
      
      <div *ngIf="googleSignIn.error()">
        Error: {{ googleSignIn.error() }}
      </div>
    </ng-template>
  `
})
export class AuthComponent {
  // Auth state
  authState = createUserState();
  
  // Auth operations
  googleSignIn = signInWithGoogle();
  signOutAction = signOut();
  profileUpdate = updateUserProfile({ displayName: 'New Name' });
  
  async handleGoogleSignIn() {
    await this.googleSignIn.signIn();
  }
  
  async handleSignOut() {
    await this.signOutAction.logout();
  }
  
  async updateProfile() {
    await this.profileUpdate.update();
  }
}
```

## Best Practices

1. **Compose Functions**: Mix and match authentication functions as needed
2. **Handle Errors**: Always check error signals in your templates
3. **Loading States**: Use status signals to show loading indicators
4. **Cleanup**: Functions automatically clean up subscriptions when components are destroyed
5. **Type Safety**: All functions are fully typed for better development experience

## Error Handling

All authentication functions provide error signals that you can use to display user-friendly error messages:

```typescript
// Check for errors
if (signIn.error()) {
  console.error('Sign in failed:', signIn.error());
}

// Display in template
<div *ngIf="signIn.error()" class="error-message">
  {{ signIn.error() }}
</div>
```

## Security Considerations

- Always validate user input before passing to authentication functions
- Handle authentication errors gracefully
- Implement proper security rules in Firebase
- Use HTTPS in production
- Consider implementing rate limiting for authentication attempts
