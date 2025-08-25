import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { 
  uploadFile, 
  downloadFile, 
  listFiles, 
  deleteFile 
} from './storage';
import { FIREBASE_APP, FIREBASE_STORAGE } from './app';
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  getMetadata, 
  listAll, 
  deleteObject 
} from 'firebase/storage';

// Mock Firebase Storage
vi.mock('firebase/storage', () => ({
  ref: vi.fn(),
  uploadBytesResumable: vi.fn(),
  getDownloadURL: vi.fn(),
  getMetadata: vi.fn(),
  listAll: vi.fn(),
  deleteObject: vi.fn()
}));

// Mock Firebase App and Storage
const mockFirebaseApp = {};
const mockStorage = {};

describe('Storage Functions', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: FIREBASE_APP, useValue: mockFirebaseApp },
        { provide: FIREBASE_STORAGE, useValue: mockStorage }
      ]
    });
    
    vi.clearAllMocks();
  });

  describe('uploadFile', () => {
    it('should create upload function', () => {
      const mockStorageRef = { fullPath: 'uploads/test.jpg' };
      (ref as any).mockReturnValue(mockStorageRef);

      const result = uploadFile('uploads/test.jpg');

      expect(ref).toHaveBeenCalledWith(mockStorage, 'uploads/test.jpg');
      expect(result.data).toBeDefined();
      expect(result.progress).toBeDefined();
      expect(result.status).toBeDefined();
      expect(result.error).toBeDefined();
      expect(result.upload).toBeDefined();
    });

    it('should upload file successfully', async () => {
      const mockStorageRef = { fullPath: 'uploads/test.jpg' };
      const mockUploadTask = {
        on: vi.fn(),
        snapshot: {
          ref: mockStorageRef
        }
      };
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockDownloadURL = 'https://example.com/test.jpg';
      const mockMetadata = {
        name: 'test.jpg',
        fullPath: 'uploads/test.jpg',
        size: 1024,
        contentType: 'image/jpeg',
        timeCreated: '2023-01-01T00:00:00Z',
        updated: '2023-01-01T00:00:00Z'
      };

      (ref as any).mockReturnValue(mockStorageRef);
      (uploadBytesResumable as any).mockReturnValue(mockUploadTask);
      (getDownloadURL as any).mockResolvedValue(mockDownloadURL);
      (getMetadata as any).mockResolvedValue(mockMetadata);

      mockUploadTask.on.mockImplementation((event, next, error, complete) => {
        if (event === 'state_changed') {
          // Simulate progress
          next({
            bytesTransferred: 512,
            totalBytes: 1024
          });
          // Simulate completion
          complete();
        }
      });

      const result = uploadFile('uploads/test.jpg');
      await result.upload(mockFile);

      expect(uploadBytesResumable).toHaveBeenCalledWith(mockStorageRef, mockFile);
      expect(getDownloadURL).toHaveBeenCalledWith(mockStorageRef);
      expect(getMetadata).toHaveBeenCalledWith(mockStorageRef);
    });

    it('should handle upload error', async () => {
      const mockStorageRef = { fullPath: 'uploads/test.jpg' };
      const mockUploadTask = {
        on: vi.fn()
      };
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      (ref as any).mockReturnValue(mockStorageRef);
      (uploadBytesResumable as any).mockReturnValue(mockUploadTask);

      mockUploadTask.on.mockImplementation((event, next, error) => {
        if (event === 'state_changed') {
          error(new Error('Upload failed'));
        }
      });

      const result = uploadFile('uploads/test.jpg');
      await result.upload(mockFile);

      expect(result.status()).toBe('error');
      expect(result.error()).toBe('Upload failed');
    });
  });

  describe('downloadFile', () => {
    it('should create download function', () => {
      const mockStorageRef = { fullPath: 'uploads/test.jpg' };
      (ref as any).mockReturnValue(mockStorageRef);

      const result = downloadFile('uploads/test.jpg');

      expect(ref).toHaveBeenCalledWith(mockStorage, 'uploads/test.jpg');
      expect(result.data).toBeDefined();
      expect(result.status).toBeDefined();
      expect(result.error).toBeDefined();
      expect(result.download).toBeDefined();
    });

    it('should download file successfully', async () => {
      const mockStorageRef = { fullPath: 'uploads/test.jpg' };
      const mockDownloadURL = 'https://example.com/test.jpg';
      const mockMetadata = {
        name: 'test.jpg',
        fullPath: 'uploads/test.jpg',
        size: 1024,
        contentType: 'image/jpeg',
        timeCreated: '2023-01-01T00:00:00Z',
        updated: '2023-01-01T00:00:00Z'
      };

      (ref as any).mockReturnValue(mockStorageRef);
      (getDownloadURL as any).mockResolvedValue(mockDownloadURL);
      (getMetadata as any).mockResolvedValue(mockMetadata);

      const result = downloadFile('uploads/test.jpg');
      await result.download();

      expect(getDownloadURL).toHaveBeenCalledWith(mockStorageRef);
      expect(getMetadata).toHaveBeenCalledWith(mockStorageRef);
      expect(result.status()).toBe('success');
      expect(result.data()).toEqual({
        url: mockDownloadURL,
        file: {
          name: 'test.jpg',
          fullPath: 'uploads/test.jpg',
          size: 1024,
          contentType: 'image/jpeg',
          timeCreated: new Date('2023-01-01T00:00:00Z'),
          updated: new Date('2023-01-01T00:00:00Z'),
          downloadURL: mockDownloadURL
        }
      });
    });

    it('should handle download error', async () => {
      const mockStorageRef = { fullPath: 'uploads/test.jpg' };
      const error = new Error('File not found');

      (ref as any).mockReturnValue(mockStorageRef);
      (getDownloadURL as any).mockRejectedValue(error);

      const result = downloadFile('uploads/test.jpg');
      await result.download();

      expect(result.status()).toBe('error');
      expect(result.error()).toBe('File not found');
    });
  });

  describe('listFiles', () => {
    it('should create list function', () => {
      const mockStorageRef = { fullPath: 'uploads' };
      (ref as any).mockReturnValue(mockStorageRef);

      const result = listFiles('uploads');

      expect(ref).toHaveBeenCalledWith(mockStorage, 'uploads');
      expect(result.data).toBeDefined();
      expect(result.status).toBeDefined();
      expect(result.error).toBeDefined();
      expect(result.list).toBeDefined();
    });

    it('should list files successfully', async () => {
      const mockStorageRef = { fullPath: 'uploads' };
      const mockItems = [
        { fullPath: 'uploads/file1.jpg' },
        { fullPath: 'uploads/file2.jpg' }
      ];
      const mockResult = { items: mockItems };
      const mockMetadata1 = {
        name: 'file1.jpg',
        fullPath: 'uploads/file1.jpg',
        size: 1024,
        contentType: 'image/jpeg',
        timeCreated: '2023-01-01T00:00:00Z',
        updated: '2023-01-01T00:00:00Z'
      };
      const mockMetadata2 = {
        name: 'file2.jpg',
        fullPath: 'uploads/file2.jpg',
        size: 2048,
        contentType: 'image/jpeg',
        timeCreated: '2023-01-02T00:00:00Z',
        updated: '2023-01-02T00:00:00Z'
      };
      const mockDownloadURL1 = 'https://example.com/file1.jpg';
      const mockDownloadURL2 = 'https://example.com/file2.jpg';

      (ref as any).mockReturnValue(mockStorageRef);
      (listAll as any).mockResolvedValue(mockResult);
      (getMetadata as any)
        .mockResolvedValueOnce(mockMetadata1)
        .mockResolvedValueOnce(mockMetadata2);
      (getDownloadURL as any)
        .mockResolvedValueOnce(mockDownloadURL1)
        .mockResolvedValueOnce(mockDownloadURL2);

      const result = listFiles('uploads');
      await result.list();

      expect(listAll).toHaveBeenCalledWith(mockStorageRef);
      expect(result.status()).toBe('success');
      expect(result.data()).toHaveLength(2);
      expect(result.data()[0]).toEqual({
        name: 'file1.jpg',
        fullPath: 'uploads/file1.jpg',
        size: 1024,
        contentType: 'image/jpeg',
        timeCreated: new Date('2023-01-01T00:00:00Z'),
        updated: new Date('2023-01-01T00:00:00Z'),
        downloadURL: mockDownloadURL1
      });
    });

    it('should handle list error', async () => {
      const mockStorageRef = { fullPath: 'uploads' };
      const error = new Error('Permission denied');

      (ref as any).mockReturnValue(mockStorageRef);
      (listAll as any).mockRejectedValue(error);

      const result = listFiles('uploads');
      await result.list();

      expect(result.status()).toBe('error');
      expect(result.error()).toBe('Permission denied');
    });

    it('should skip files that cannot be accessed', async () => {
      const mockStorageRef = { fullPath: 'uploads' };
      const mockItems = [
        { fullPath: 'uploads/file1.jpg' },
        { fullPath: 'uploads/file2.jpg' }
      ];
      const mockResult = { items: mockItems };
      const mockMetadata = {
        name: 'file1.jpg',
        fullPath: 'uploads/file1.jpg',
        size: 1024,
        contentType: 'image/jpeg',
        timeCreated: '2023-01-01T00:00:00Z',
        updated: '2023-01-01T00:00:00Z'
      };
      const mockDownloadURL = 'https://example.com/file1.jpg';

      (ref as any).mockReturnValue(mockStorageRef);
      (listAll as any).mockResolvedValue(mockResult);
      (getMetadata as any)
        .mockResolvedValueOnce(mockMetadata)
        .mockRejectedValueOnce(new Error('File not accessible'));
      (getDownloadURL as any).mockResolvedValue(mockDownloadURL);

      const result = listFiles('uploads');
      await result.list();

      expect(result.status()).toBe('success');
      expect(result.data()).toHaveLength(1);
    });
  });

  describe('deleteFile', () => {
    it('should create delete function', () => {
      const mockStorageRef = { fullPath: 'uploads/test.jpg' };
      (ref as any).mockReturnValue(mockStorageRef);

      const result = deleteFile('uploads/test.jpg');

      expect(ref).toHaveBeenCalledWith(mockStorage, 'uploads/test.jpg');
      expect(result.status).toBeDefined();
      expect(result.error).toBeDefined();
      expect(result.deleteFile).toBeDefined();
    });

    it('should delete file successfully', async () => {
      const mockStorageRef = { fullPath: 'uploads/test.jpg' };

      (ref as any).mockReturnValue(mockStorageRef);
      (deleteObject as any).mockResolvedValue(undefined);

      const result = deleteFile('uploads/test.jpg');
      await result.deleteFile();

      expect(deleteObject).toHaveBeenCalledWith(mockStorageRef);
      expect(result.status()).toBe('success');
    });

    it('should handle delete error', async () => {
      const mockStorageRef = { fullPath: 'uploads/test.jpg' };
      const error = new Error('File not found');

      (ref as any).mockReturnValue(mockStorageRef);
      (deleteObject as any).mockRejectedValue(error);

      const result = deleteFile('uploads/test.jpg');
      await result.deleteFile();

      expect(result.status()).toBe('error');
      expect(result.error()).toBe('File not found');
    });
  });
});
