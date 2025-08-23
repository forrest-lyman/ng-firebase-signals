// fx/auth.ts
import { signal, inject, DestroyRef } from '@angular/core';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  updatePassword,
  deleteUser,
  sendEmailVerification,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  confirmPasswordReset as firebaseConfirmPasswordReset,
  GoogleAuthProvider,
  User,
  Auth
} from 'firebase/auth';
import { FIREBASE_AUTH } from './app';

export type AuthStatus = 'idle' | 'loading' | 'success' | 'error';

// User state signal
export function createUserState() {
  const user = signal<User | null>(null);
  const loading = signal(true);
  const error = signal<string | null>(null);

  const destroyRef = inject(DestroyRef);
  const auth = inject(FIREBASE_AUTH);

  // Listen to auth state changes
  const unsubscribe = auth.onAuthStateChanged((currentUser) => {
    if (currentUser) {
      user.set(currentUser);
    } else {
      user.set(null);
    }
    loading.set(false);
    error.set(null);
  }, (authError) => {
    error.set(authError.message);
    loading.set(false);
  });

  destroyRef.onDestroy(() => {
    unsubscribe();
  });

  return { user, loading, error };
}

// Google sign in
export function signInWithGoogle() {
  const status = signal<AuthStatus>('idle');
  const error = signal<string | null>(null);

  const auth = inject(FIREBASE_AUTH);

  const signIn = async () => {
    status.set('loading');
    error.set(null);

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      status.set('success');
    } catch (err: any) {
      status.set('error');
      error.set(err.message);
    }
  };

  return { signIn, status, error };
}

// Email/password sign in
export function signInWithEmail(email: string, password: string) {
  const status = signal<AuthStatus>('idle');
  const error = signal<string | null>(null);

  const auth = inject(FIREBASE_AUTH);

  const signIn = async () => {
    status.set('loading');
    error.set(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      status.set('success');
    } catch (err: any) {
      status.set('error');
      error.set(err.message);
    }
  };

  return { signIn, status, error };
}

// Create user with email/password
export function createUser(email: string, password: string) {
  const status = signal<AuthStatus>('idle');
  const error = signal<string | null>(null);

  const auth = inject(FIREBASE_AUTH);

  const create = async () => {
    status.set('loading');
    error.set(null);

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      status.set('success');
    } catch (err: any) {
      status.set('error');
      error.set(err.message);
    }
  };

  return { create, status, error };
}

// Sign out
export function signOut() {
  const status = signal<AuthStatus>('idle');
  const error = signal<string | null>(null);

  const auth = inject(FIREBASE_AUTH);

  const logout = async () => {
    status.set('loading');
    error.set(null);

    try {
      await firebaseSignOut(auth);
      status.set('success');
    } catch (err: any) {
      status.set('error');
      error.set(err.message);
    }
  };

  return { logout, status, error };
}

// Update user profile
export function updateUserProfile(updates: { displayName?: string; photoURL?: string }) {
  const status = signal<AuthStatus>('idle');
  const error = signal<string | null>(null);

  const auth = inject(FIREBASE_AUTH);

  const update = async () => {
    status.set('loading');
    error.set(null);

    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, updates);
        status.set('success');
      } else {
        throw new Error('No user signed in');
      }
    } catch (err: any) {
      status.set('error');
      error.set(err.message);
    }
  };

  return { update, status, error };
}

// Change password
export function changePassword(newPassword: string) {
  const status = signal<AuthStatus>('idle');
  const error = signal<string | null>(null);

  const auth = inject(FIREBASE_AUTH);

  const change = async () => {
    status.set('loading');
    error.set(null);

    try {
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPassword);
        status.set('success');
      } else {
        throw new Error('No user signed in');
      }
    } catch (err: any) {
      status.set('error');
      error.set(err.message);
    }
  };

  return { change, status, error };
}

// Delete user account
export function deleteUserAccount() {
  const status = signal<AuthStatus>('idle');
  const error = signal<string | null>(null);

  const auth = inject(FIREBASE_AUTH);

  const deleteAccount = async () => {
    status.set('loading');
    error.set(null);

    try {
      if (auth.currentUser) {
        await deleteUser(auth.currentUser);
        status.set('success');
      } else {
        throw new Error('No user signed in');
      }
    } catch (err: any) {
      status.set('error');
      error.set(err.message);
    }
  };

  return { deleteAccount, status, error };
}

// Send email verification
export function sendEmailVerificationEmail() {
  const status = signal<AuthStatus>('idle');
  const error = signal<string | null>(null);

  const auth = inject(FIREBASE_AUTH);

  const send = async () => {
    status.set('loading');
    error.set(null);

    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        status.set('success');
      } else {
        throw new Error('No user signed in');
      }
    } catch (err: any) {
      status.set('error');
      error.set(err.message);
    }
  };

  return { send, status, error };
}

// Send password reset email
export function sendPasswordResetEmail(email: string) {
  const status = signal<AuthStatus>('idle');
  const error = signal<string | null>(null);

  const auth = inject(FIREBASE_AUTH);

  const send = async () => {
    status.set('loading');
    error.set(null);

    try {
      await firebaseSendPasswordResetEmail(auth, email);
      status.set('success');
    } catch (err: any) {
      status.set('error');
      error.set(err.message);
    }
  };

  return { send, status, error };
}

// Confirm password reset
export function confirmPasswordReset(oobCode: string, newPassword: string) {
  const status = signal<AuthStatus>('idle');
  const error = signal<string | null>(null);

  const auth = inject(FIREBASE_AUTH);

  const confirm = async () => {
    status.set('loading');
    error.set(null);

    try {
      await firebaseConfirmPasswordReset(auth, oobCode, newPassword);
      status.set('success');
    } catch (err: any) {
      status.set('error');
      error.set(err.message);
    }
  };

  return { confirm, status, error };
}
