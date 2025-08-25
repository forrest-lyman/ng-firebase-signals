import { describe, it, expect, vi, beforeEach } from 'vitest';
import { provideFirebase, FIREBASE_APP, FIREBASE_AUTH, FIREBASE_FIRESTORE, FIREBASE_STORAGE } from './app';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Mock Firebase modules
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn()
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn()
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn()
}));

vi.mock('firebase/storage', () => ({
  getStorage: vi.fn()
}));

describe('App Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('provideFirebase', () => {
    it('should provide Firebase services with valid config', () => {
      const mockApp = { name: 'test-app' };
      const mockAuth = { app: mockApp };
      const mockFirestore = { app: mockApp };
      const mockStorage = { app: mockApp };

      (initializeApp as any).mockReturnValue(mockApp);
      (getAuth as any).mockReturnValue(mockAuth);
      (getFirestore as any).mockReturnValue(mockFirestore);
      (getStorage as any).mockReturnValue(mockStorage);

      const config = {
        apiKey: 'test-api-key',
        authDomain: 'test-project.firebaseapp.com',
        projectId: 'test-project-id',
        storageBucket: 'test-project.appspot.com',
        messagingSenderId: '123456789',
        appId: 'test-app-id'
      };

      const providers = provideFirebase(config);

      expect(initializeApp).toHaveBeenCalledWith(config);
      expect(providers).toHaveLength(4);
      
      // Check FIREBASE_APP provider
      expect(providers[0].provide).toBe(FIREBASE_APP);
      expect(providers[0].useValue).toBe(mockApp);

      // Check FIREBASE_AUTH provider
      expect(providers[1].provide).toBe(FIREBASE_AUTH);
      expect(providers[1].useFactory).toBeDefined();
      expect(providers[1].deps).toEqual([FIREBASE_APP]);

      // Check FIREBASE_FIRESTORE provider
      expect(providers[2].provide).toBe(FIREBASE_FIRESTORE);
      expect(providers[2].useFactory).toBeDefined();
      expect(providers[2].deps).toEqual([FIREBASE_APP]);

      // Check FIREBASE_STORAGE provider
      expect(providers[3].provide).toBe(FIREBASE_STORAGE);
      expect(providers[3].useFactory).toBeDefined();
      expect(providers[3].deps).toEqual([FIREBASE_APP]);
    });

    it('should handle optional config properties', () => {
      const mockApp = { name: 'test-app' };
      const mockAuth = { app: mockApp };
      const mockFirestore = { app: mockApp };
      const mockStorage = { app: mockApp };

      (initializeApp as any).mockReturnValue(mockApp);
      (getAuth as any).mockReturnValue(mockAuth);
      (getFirestore as any).mockReturnValue(mockFirestore);
      (getStorage as any).mockReturnValue(mockStorage);

      const config = {
        apiKey: 'test-api-key',
        authDomain: 'test-project.firebaseapp.com',
        projectId: 'test-project-id',
        storageBucket: 'test-project.appspot.com',
        messagingSenderId: '123456789',
        appId: 'test-app-id',
        measurementId: 'G-TEST123',
        databaseURL: 'https://test-project.firebaseio.com'
      };

      const providers = provideFirebase(config);

      expect(initializeApp).toHaveBeenCalledWith(config);
      expect(providers).toHaveLength(4);
    });
  });

  describe('Injection Tokens', () => {
    it('should export FIREBASE_APP token', () => {
      expect(FIREBASE_APP).toBeDefined();
      expect(FIREBASE_APP).toBeInstanceOf(Object);
    });

    it('should export FIREBASE_AUTH token', () => {
      expect(FIREBASE_AUTH).toBeDefined();
      expect(FIREBASE_AUTH).toBeInstanceOf(Object);
    });

    it('should export FIREBASE_FIRESTORE token', () => {
      expect(FIREBASE_FIRESTORE).toBeDefined();
      expect(FIREBASE_FIRESTORE).toBeInstanceOf(Object);
    });

    it('should export FIREBASE_STORAGE token', () => {
      expect(FIREBASE_STORAGE).toBeDefined();
      expect(FIREBASE_STORAGE).toBeInstanceOf(Object);
    });
  });

  describe('Provider Factory Functions', () => {
    it('should create auth service with app dependency', () => {
      const mockApp = { 
        name: 'test-app',
        options: {},
        automaticDataCollectionEnabled: false
      } as any;
      const mockAuth = { app: mockApp };

      (getAuth as any).mockReturnValue(mockAuth);

      const providers = provideFirebase({
        apiKey: 'test',
        authDomain: 'test',
        projectId: 'test',
        storageBucket: 'test',
        messagingSenderId: '123',
        appId: 'test'
      });

      const authProvider = providers[1];
      const authFactory = authProvider.useFactory;
      if (authFactory) {
        const result = authFactory(mockApp);
        expect(getAuth).toHaveBeenCalledWith(mockApp);
        expect(result).toBe(mockAuth);
      }
    });

    it('should create firestore service with app dependency', () => {
      const mockApp = { 
        name: 'test-app',
        options: {},
        automaticDataCollectionEnabled: false
      } as any;
      const mockFirestore = { app: mockApp };

      (getFirestore as any).mockReturnValue(mockFirestore);

      const providers = provideFirebase({
        apiKey: 'test',
        authDomain: 'test',
        projectId: 'test',
        storageBucket: 'test',
        messagingSenderId: '123',
        appId: 'test'
      });

      const firestoreProvider = providers[2];
      const firestoreFactory = firestoreProvider.useFactory;
      if (firestoreFactory) {
        const result = firestoreFactory(mockApp);
        expect(getFirestore).toHaveBeenCalledWith(mockApp);
        expect(result).toBe(mockFirestore);
      }
    });

    it('should create storage service with app dependency', () => {
      const mockApp = { 
        name: 'test-app',
        options: {},
        automaticDataCollectionEnabled: false
      } as any;
      const mockStorage = { app: mockApp };

      (getStorage as any).mockReturnValue(mockStorage);

      const providers = provideFirebase({
        apiKey: 'test',
        authDomain: 'test',
        projectId: 'test',
        storageBucket: 'test',
        messagingSenderId: '123',
        appId: 'test'
      });

      const storageProvider = providers[3];
      const storageFactory = storageProvider.useFactory;
      if (storageFactory) {
        const result = storageFactory(mockApp);
        expect(getStorage).toHaveBeenCalledWith(mockApp);
        expect(result).toBe(mockStorage);
      }
    });
  });
});
