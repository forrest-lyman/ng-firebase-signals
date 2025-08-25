// fx/auth.ts
import { signal, inject, DestroyRef } from '@angular/core';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile as firebaseUpdateProfile,
  updatePassword as firebaseUpdatePassword,
  deleteUser as firebaseDeleteUser,
  sendEmailVerification as firebaseSendEmailVerification,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  confirmPasswordReset as firebaseConfirmPasswordReset,
  onAuthStateChanged,
  User,
  Auth,
  UserCredential
} from 'firebase/auth';
import { FIREBASE_AUTH } from './app';

// User state signal
export const userState = signal<{
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}>({
  currentUser: null,
  isAuthenticated: false,
  isLoading: true
});

// Initialize auth state listener
export function initializeAuth() {
  const auth = inject(FIREBASE_AUTH);
  const destroyRef = inject(DestroyRef);

  const unsubscribe = onAuthStateChanged(auth, (user) => {
    userState.set({
      currentUser: user,
      isAuthenticated: !!user,
      isLoading: false
    });
  });

  destroyRef.onDestroy(() => unsubscribe());
}

// Google Sign In
export async function signInWithGoogle(): Promise<UserCredential> {
  const auth = inject(FIREBASE_AUTH);
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
}

// Email/Password Sign In
export async function signInWithEmail(email: string, password: string): Promise<UserCredential> {
  const auth = inject(FIREBASE_AUTH);
  return signInWithEmailAndPassword(auth, email, password);
}

// Create User Account
export async function createUser(email: string, password: string, displayName?: string): Promise<UserCredential> {
  const auth = inject(FIREBASE_AUTH);
  const result = await createUserWithEmailAndPassword(auth, email, password);

  if (displayName && result.user) {
    await firebaseUpdateProfile(result.user, { displayName });
  }

  return result;
}

// Sign Out
export async function signOut(): Promise<void> {
  const auth = inject(FIREBASE_AUTH);
  return firebaseSignOut(auth);
}

// Update User Profile
export async function updateUserProfile(displayName?: string, photoURL?: string): Promise<void> {
  const auth = inject(FIREBASE_AUTH);
  const user = auth.currentUser;

  if (!user) {
    throw new Error('No user is currently signed in');
  }

  return firebaseUpdateProfile(user, { displayName, photoURL });
}

// Change Password
export async function changePassword(newPassword: string): Promise<void> {
  const auth = inject(FIREBASE_AUTH);
  const user = auth.currentUser;

  if (!user) {
    throw new Error('No user is currently signed in');
  }

  return firebaseUpdatePassword(user, newPassword);
}

// Delete User Account
export async function deleteUserAccount(): Promise<void> {
  const auth = inject(FIREBASE_AUTH);
  const user = auth.currentUser;

  if (!user) {
    throw new Error('No user is currently signed in');
  }

  return firebaseDeleteUser(user);
}

// Send Email Verification
export async function sendEmailVerification(): Promise<void> {
  const auth = inject(FIREBASE_AUTH);
  const user = auth.currentUser;

  if (!user) {
    throw new Error('No user is currently signed in');
  }

  return firebaseSendEmailVerification(user);
}

// Send Password Reset Email
export async function sendPasswordResetEmail(email: string): Promise<void> {
  const auth = inject(FIREBASE_AUTH);
  return firebaseSendPasswordResetEmail(auth, email);
}

// Confirm Password Reset
export async function confirmPasswordReset(code: string, newPassword: string): Promise<void> {
  const auth = inject(FIREBASE_AUTH);
  return firebaseConfirmPasswordReset(auth, code, newPassword);
}
