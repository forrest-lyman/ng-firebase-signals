import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  signInWithGoogle, 
  signInWithEmail, 
  createUser, 
  signOut, 
  sendPasswordResetEmail, 
  confirmPasswordReset
} from './auth';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  confirmPasswordReset as firebaseConfirmPasswordReset,
  GoogleAuthProvider
} from 'firebase/auth';

// Mock Firebase Auth
vi.mock('firebase/auth', () => ({
  signInWithPopup: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  confirmPasswordReset: vi.fn(),
  GoogleAuthProvider: vi.fn().mockImplementation(() => ({
    addScope: vi.fn().mockReturnThis()
  }))
}));

// Mock Angular inject
vi.mock('@angular/core', () => ({
  inject: vi.fn((token: string) => {
    if (token === 'FIREBASE_AUTH') return {};
    if (token === 'FIREBASE_APP') return {};
    if (token === 'DestroyRef') return { onDestroy: vi.fn() };
    return null;
  }),
  signal: vi.fn((initialValue) => ({
    set: vi.fn(),
    update: vi.fn(),
    call: vi.fn(() => initialValue)
  })),
  DestroyRef: vi.fn().mockImplementation(() => ({
    onDestroy: vi.fn()
  })),
  InjectionToken: vi.fn().mockImplementation((name: string) => name)
}));

// Mock the FIREBASE_AUTH token
vi.mock('./app', () => ({
  FIREBASE_AUTH: 'FIREBASE_AUTH'
}));

describe('Authentication Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signInWithGoogle', () => {
    it('should sign in with Google successfully', async () => {
      const mockUser = { uid: '123', email: 'test@example.com' };
      (signInWithPopup as any).mockResolvedValue({ user: mockUser });

      const result = await signInWithGoogle();
      
      expect(signInWithPopup).toHaveBeenCalledWith({}, expect.any(Object));
      expect(result).toEqual({ user: mockUser });
    });

    it('should throw error on sign in failure', async () => {
      const error = new Error('Sign in failed');
      (signInWithPopup as any).mockRejectedValue(error);

      await expect(signInWithGoogle()).rejects.toThrow('Sign in failed');
    });
  });

  describe('signInWithEmail', () => {
    it('should sign in with email successfully', async () => {
      const mockUser = { uid: '123', email: 'test@example.com' };
      (signInWithEmailAndPassword as any).mockResolvedValue({ user: mockUser });

      const result = await signInWithEmail('test@example.com', 'password123');
      
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith({}, 'test@example.com', 'password123');
      expect(result).toEqual({ user: mockUser });
    });

    it('should throw error on sign in failure', async () => {
      const error = new Error('Invalid credentials');
      (signInWithEmailAndPassword as any).mockRejectedValue(error);

      await expect(signInWithEmail('test@example.com', 'wrong')).rejects.toThrow('Invalid credentials');
    });
  });

  describe('createUser', () => {
    it('should create user account successfully', async () => {
      const mockUser = { uid: '123', email: 'new@example.com' };
      (createUserWithEmailAndPassword as any).mockResolvedValue({ user: mockUser });

      const result = await createUser('new@example.com', 'password123');
      
      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith({}, 'new@example.com', 'password123');
      expect(result).toEqual({ user: mockUser });
    });

    it('should throw error on user creation failure', async () => {
      const error = new Error('Email already in use');
      (createUserWithEmailAndPassword as any).mockRejectedValue(error);

      await expect(createUser('existing@example.com', 'password123')).rejects.toThrow('Email already in use');
    });
  });

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      (firebaseSignOut as any).mockResolvedValue(undefined);

      await signOut();
      
      expect(firebaseSignOut).toHaveBeenCalledWith({});
    });

    it('should throw error on sign out failure', async () => {
      const error = new Error('Sign out failed');
      (firebaseSignOut as any).mockRejectedValue(error);

      await expect(signOut()).rejects.toThrow('Sign out failed');
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should send password reset email successfully', async () => {
      (firebaseSendPasswordResetEmail as any).mockResolvedValue(undefined);

      await sendPasswordResetEmail('test@example.com');
      
      expect(firebaseSendPasswordResetEmail).toHaveBeenCalledWith({}, 'test@example.com');
    });

    it('should throw error on password reset failure', async () => {
      const error = new Error('User not found');
      (firebaseSendPasswordResetEmail as any).mockRejectedValue(error);

      await expect(sendPasswordResetEmail('nonexistent@example.com')).rejects.toThrow('User not found');
    });
  });

  describe('confirmPasswordReset', () => {
    it('should confirm password reset successfully', async () => {
      (firebaseConfirmPasswordReset as any).mockResolvedValue(undefined);

      await confirmPasswordReset('reset-code', 'newpassword123');
      
      expect(firebaseConfirmPasswordReset).toHaveBeenCalledWith({}, 'reset-code', 'newpassword123');
    });

    it('should throw error on password reset confirmation failure', async () => {
      const error = new Error('Invalid reset code');
      (firebaseConfirmPasswordReset as any).mockRejectedValue(error);

      await expect(confirmPasswordReset('invalid-code', 'newpassword123')).rejects.toThrow('Invalid reset code');
    });
  });
});
