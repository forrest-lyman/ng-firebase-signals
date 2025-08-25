import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { 
  docData, 
  collectionData, 
  createQuery, 
  whereField, 
  orderByField, 
  limitResults, 
  startAfterDoc, 
  endBeforeDoc,
  useDocRef,
  useCollectionRef,
  useQuery
} from './firestore';
import { FIREBASE_APP, FIREBASE_FIRESTORE } from './app';
import { 
  doc, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter, 
  endBefore,
  onSnapshot,
  DocumentData,
  QuerySnapshot,
  DocumentSnapshot
} from 'firebase/firestore';

// Mock Firebase Firestore
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  startAfter: vi.fn(),
  endBefore: vi.fn(),
  onSnapshot: vi.fn()
}));

// Mock Firebase App and Firestore
const mockFirebaseApp = {};
const mockFirestore = {};

describe('Firestore Functions', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: FIREBASE_APP, useValue: mockFirebaseApp },
        { provide: FIREBASE_FIRESTORE, useValue: mockFirestore }
      ]
    });
    
    vi.clearAllMocks();
  });

  describe('docData', () => {
    it('should create document data signal', () => {
      const mockDocRef = { id: 'doc1', path: 'users/doc1' };
      (doc as any).mockReturnValue(mockDocRef);

      const result = docData('users', 'doc1');

      expect(doc).toHaveBeenCalledWith(mockFirestore, 'users', 'doc1');
      expect(result.data).toBeDefined();
      expect(result.status).toBeDefined();
      expect(result.error).toBeDefined();
      expect(result.load).toBeDefined();
    });

    it('should load document data successfully', async () => {
      const mockDocRef = { id: 'doc1', path: 'users/doc1' };
      const mockData = { name: 'John', age: 30 };
      const mockSnapshot = { data: () => mockData, exists: () => true };
      
      (doc as any).mockReturnValue(mockDocRef);
      (onSnapshot as any).mockImplementation((docRef, callback) => {
        callback(mockSnapshot);
        return () => {};
      });

      const result = docData('users', 'doc1');
      await result.load();

      expect(onSnapshot).toHaveBeenCalledWith(mockDocRef, expect.any(Function), expect.any(Function));
    });

    it('should handle document not found', async () => {
      const mockDocRef = { id: 'doc1', path: 'users/doc1' };
      const mockSnapshot = { data: () => null, exists: () => false };
      
      (doc as any).mockReturnValue(mockDocRef);
      (onSnapshot as any).mockImplementation((docRef, callback) => {
        callback(mockSnapshot);
        return () => {};
      });

      const result = docData('users', 'doc1');
      await result.load();

      expect(result.data()).toBeNull();
    });
  });

  describe('collectionData', () => {
    it('should create collection data signal', () => {
      const mockCollectionRef = { id: 'users', path: 'users' };
      (collection as any).mockReturnValue(mockCollectionRef);

      const result = collectionData('users');

      expect(collection).toHaveBeenCalledWith(mockFirestore, 'users');
      expect(result.data).toBeDefined();
      expect(result.status).toBeDefined();
      expect(result.error).toBeDefined();
      expect(result.load).toBeDefined();
    });

    it('should load collection data successfully', async () => {
      const mockCollectionRef = { id: 'users', path: 'users' };
      const mockDocs = [
        { id: 'doc1', data: () => ({ name: 'John', age: 30 }) },
        { id: 'doc2', data: () => ({ name: 'Jane', age: 25 }) }
      ];
      const mockSnapshot = { docs: mockDocs };
      
      (collection as any).mockReturnValue(mockCollectionRef);
      (onSnapshot as any).mockImplementation((collectionRef, callback) => {
        callback(mockSnapshot);
        return () => {};
      });

      const result = collectionData('users');
      await result.load();

      expect(onSnapshot).toHaveBeenCalledWith(mockCollectionRef, expect.any(Function), expect.any(Function));
    });
  });

  describe('createQuery', () => {
    it('should create a basic query', () => {
      const mockCollectionRef = { id: 'users', path: 'users' };
      const mockQuery = { id: 'query1' };
      
      (collection as any).mockReturnValue(mockCollectionRef);
      (query as any).mockReturnValue(mockQuery);

      const result = createQuery('users');

      expect(collection).toHaveBeenCalledWith(mockFirestore, 'users');
      expect(query).toHaveBeenCalledWith(mockCollectionRef);
      expect(result).toBe(mockQuery);
    });
  });

  describe('whereField', () => {
    it('should add where clause to query', () => {
      const mockQuery = { id: 'query1' };
      const mockWhereQuery = { id: 'whereQuery1' };
      
      (where as any).mockReturnValue(mockWhereQuery);

      const result = whereField(mockQuery, 'age', '>', 25);

      expect(where).toHaveBeenCalledWith('age', '>', 25);
      expect(result).toBe(mockWhereQuery);
    });
  });

  describe('orderByField', () => {
    it('should add orderBy clause to query', () => {
      const mockQuery = { id: 'query1' };
      const mockOrderQuery = { id: 'orderQuery1' };
      
      (orderBy as any).mockReturnValue(mockOrderQuery);

      const result = orderByField(mockQuery, 'name', 'asc');

      expect(orderBy).toHaveBeenCalledWith('name', 'asc');
      expect(result).toBe(mockOrderQuery);
    });
  });

  describe('limitResults', () => {
    it('should add limit clause to query', () => {
      const mockQuery = { id: 'query1' };
      const mockLimitQuery = { id: 'limitQuery1' };
      
      (limit as any).mockReturnValue(mockLimitQuery);

      const result = limitResults(mockQuery, 10);

      expect(limit).toHaveBeenCalledWith(10);
      expect(result).toBe(mockLimitQuery);
    });
  });

  describe('startAfterDoc', () => {
    it('should add startAfter clause to query', () => {
      const mockQuery = { id: 'query1' };
      const mockStartAfterQuery = { id: 'startAfterQuery1' };
      const mockDoc = { id: 'doc1' };
      
      (startAfter as any).mockReturnValue(mockStartAfterQuery);

      const result = startAfterDoc(mockQuery, mockDoc);

      expect(startAfter).toHaveBeenCalledWith(mockDoc);
      expect(result).toBe(mockStartAfterQuery);
    });
  });

  describe('endBeforeDoc', () => {
    it('should add endBefore clause to query', () => {
      const mockQuery = { id: 'query1' };
      const mockEndBeforeQuery = { id: 'endBeforeQuery1' };
      const mockDoc = { id: 'doc1' };
      
      (endBefore as any).mockReturnValue(mockEndBeforeQuery);

      const result = endBeforeDoc(mockQuery, mockDoc);

      expect(endBefore).toHaveBeenCalledWith(mockDoc);
      expect(result).toBe(mockEndBeforeQuery);
    });
  });

  describe('useDocRef', () => {
    it('should return document reference', () => {
      const mockDocRef = { id: 'doc1', path: 'users/doc1' };
      (doc as any).mockReturnValue(mockDocRef);

      const result = useDocRef('users', 'doc1');

      expect(doc).toHaveBeenCalledWith(mockFirestore, 'users', 'doc1');
      expect(result).toBe(mockDocRef);
    });
  });

  describe('useCollectionRef', () => {
    it('should return collection reference', () => {
      const mockCollectionRef = { id: 'users', path: 'users' };
      (collection as any).mockReturnValue(mockCollectionRef);

      const result = useCollectionRef('users');

      expect(collection).toHaveBeenCalledWith(mockFirestore, 'users');
      expect(result).toBe(mockCollectionRef);
    });
  });

  describe('useQuery', () => {
    it('should create query with multiple clauses', () => {
      const mockCollectionRef = { id: 'users', path: 'users' };
      const mockWhereQuery = { id: 'whereQuery1' };
      const mockOrderQuery = { id: 'orderQuery1' };
      const mockLimitQuery = { id: 'limitQuery1' };
      
      (collection as any).mockReturnValue(mockCollectionRef);
      (where as any).mockReturnValue(mockWhereQuery);
      (orderBy as any).mockReturnValue(mockOrderQuery);
      (limit as any).mockReturnValue(mockLimitQuery);

      const result = useQuery('users', [
        ['age', '>', 25],
        ['status', '==', 'active']
      ], 'name', 'asc', 10);

      expect(collection).toHaveBeenCalledWith(mockFirestore, 'users');
      expect(where).toHaveBeenCalledWith('age', '>', 25);
      expect(orderBy).toHaveBeenCalledWith('name', 'asc');
      expect(limit).toHaveBeenCalledWith(10);
      expect(result).toBe(mockLimitQuery);
    });

    it('should create query without optional parameters', () => {
      const mockCollectionRef = { id: 'users', path: 'users' };
      const mockQuery = { id: 'query1' };
      
      (collection as any).mockReturnValue(mockCollectionRef);
      (query as any).mockReturnValue(mockQuery);

      const result = useQuery('users');

      expect(collection).toHaveBeenCalledWith(mockFirestore, 'users');
      expect(query).toHaveBeenCalledWith(mockCollectionRef);
      expect(result).toBe(mockQuery);
    });
  });
});
