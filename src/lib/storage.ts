// fx/storage.ts
import { signal, inject, DestroyRef } from '@angular/core';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  listAll,
  deleteObject,
  getMetadata,
  StorageReference,
  UploadTask,
  UploadTaskSnapshot,
  ListResult,
  FirebaseStorage
} from 'firebase/storage';
import { FIREBASE_STORAGE } from './app';

export type StorageStatus = 'idle' | 'loading' | 'success' | 'error';

export interface StorageFile {
  name: string;
  fullPath: string;
  size: number;
  contentType: string;
  timeCreated?: Date;
  updated?: Date;
  downloadURL: string;
}

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
}

// Upload file function
export function uploadFile(path: string) {
  const data = signal<{ downloadURL: string; file: StorageFile } | null>(null);
  const progress = signal<UploadProgress | null>(null);
  const status = signal<StorageStatus>('idle');
  const error = signal<string | null>(null);

  const storage = inject(FIREBASE_STORAGE);

  const upload = async (file: File) => {
    status.set('loading');
    error.set(null);
    progress.set(null);

    try {
      const storageRef = ref(storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed',
        (snapshot: UploadTaskSnapshot) => {
          const progressData: UploadProgress = {
            bytesTransferred: snapshot.bytesTransferred,
            totalBytes: snapshot.totalBytes,
            percentage: (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          };
          progress.set(progressData);
        },
        (err) => {
          status.set('error');
          error.set(err.message);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            const metadata = await getMetadata(uploadTask.snapshot.ref);
            
            const fileData: StorageFile = {
              name: metadata.name,
              fullPath: metadata.fullPath,
              size: metadata.size,
              contentType: metadata.contentType,
              timeCreated: metadata.timeCreated ? new Date(metadata.timeCreated) : undefined,
              updated: metadata.updated ? new Date(metadata.updated) : undefined,
              downloadURL
            };

            data.set({ downloadURL, file: fileData });
            status.set('success');
          } catch (metadataError: any) {
            status.set('error');
            error.set(`Upload completed but failed to get metadata: ${metadataError.message}`);
          }
        }
      );
    } catch (err: any) {
      status.set('error');
      error.set(err.message);
    }
  };

  return {
    data,
    progress,
    status,
    error,
    upload
  };
}

// Download file function
export function downloadFile(path: string) {
  const data = signal<{ url: string; file: StorageFile } | null>(null);
  const status = signal<StorageStatus>('idle');
  const error = signal<string | null>(null);

  const storage = inject(FIREBASE_STORAGE);

  const download = async () => {
    status.set('loading');
    error.set(null);

    try {
      const storageRef = ref(storage, path);
      const downloadURL = await getDownloadURL(storageRef);
      
      // Get file metadata
      const metadata = await getMetadata(storageRef);
      
      const fileData: StorageFile = {
        name: metadata.name,
        fullPath: metadata.fullPath,
        size: metadata.size,
        contentType: metadata.contentType,
        timeCreated: metadata.timeCreated ? new Date(metadata.timeCreated) : undefined,
        updated: metadata.updated ? new Date(metadata.updated) : undefined,
        downloadURL
      };

      data.set({ url: downloadURL, file: fileData });
      status.set('success');
    } catch (err: any) {
      status.set('error');
      error.set(err.message);
    }
  };

  return {
    data,
    status,
    error,
    download
  };
}

// List files function
export function listFiles(path: string, options: { destroyRef?: DestroyRef } = {}) {
  const data = signal<StorageFile[]>([]);
  const status = signal<StorageStatus>('idle');
  const error = signal<string | null>(null);

  const storage = inject(FIREBASE_STORAGE);

  const list = async () => {
    status.set('loading');
    error.set(null);

    try {
      const storageRef = ref(storage, path);
      const result: ListResult = await listAll(storageRef);
      
      const files: StorageFile[] = [];

      // Process files
      for (const itemRef of result.items) {
        try {
          const metadata = await getMetadata(itemRef);
          const downloadURL = await getDownloadURL(itemRef);
          
          files.push({
            name: metadata.name,
            fullPath: metadata.fullPath,
            size: metadata.size,
            contentType: metadata.contentType,
            timeCreated: metadata.timeCreated ? new Date(metadata.timeCreated) : undefined,
            updated: metadata.updated ? new Date(metadata.updated) : undefined,
            downloadURL
          });
        } catch (err) {
          // Skip files that can't be accessed
          console.warn(`Could not access file: ${itemRef.fullPath}`, err);
        }
      }

      data.set(files);
      status.set('success');
    } catch (err: any) {
      status.set('error');
      error.set(err.message);
    }
  };

  // Auto-list if destroyRef is provided
  if (options.destroyRef) {
    list();
  }

  return {
    data,
    status,
    error,
    list
  };
}

// Delete file function
export function deleteFile(path: string) {
  const status = signal<StorageStatus>('idle');
  const error = signal<string | null>(null);

  const storage = inject(FIREBASE_STORAGE);

  const deleteFileAction = async () => {
    status.set('loading');
    error.set(null);

    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
      status.set('success');
    } catch (err: any) {
      status.set('error');
      error.set(err.message);
    }
  };

  return {
    status,
    error,
    deleteFile: deleteFileAction
  };
}
