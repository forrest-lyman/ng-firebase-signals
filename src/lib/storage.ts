// fx/storage.ts
import { signal, inject, DestroyRef } from '@angular/core';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  listAll,
  deleteObject,
  StorageReference,
  UploadTask,
  UploadTaskSnapshot,
  ListResult,
  FirebaseStorage
} from 'firebase/storage';
import { FIREBASE_STORAGE } from './app';

export type StorageStatus = 'idle' | 'loading' | 'success' | 'error' | 'paused' | 'cancelled';

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
}

export interface StorageFile {
  name: string;
  fullPath: string;
  size?: number;
  contentType?: string;
  timeCreated?: Date;
  updated?: Date;
  downloadURL?: string;
}

export interface UploadOptions {
  metadata?: {
    contentType?: string;
    customMetadata?: Record<string, string>;
  };
  onProgress?: (progress: UploadProgress) => void;
}

export interface ListOptions {
  maxResults?: number;
  pageToken?: string;
}

// Upload file function
export function uploadFile(
  path: string,
  file: File,
  options: UploadOptions = {}
) {
  const data = signal<StorageFile | null>(null);
  const status = signal<StorageStatus>('idle');
  const error = signal<string | null>(null);
  const progress = signal<UploadProgress | null>(null);
  const uploadTask = signal<UploadTask | null>(null);

  const destroyRef = inject(DestroyRef);
  const storage = inject(FIREBASE_STORAGE);

  const startUpload = () => {
    status.set('loading');
    error.set(null);
    progress.set(null);

    const storageRef = ref(storage, path);
    const task = uploadBytesResumable(storageRef, file, options.metadata);

    uploadTask.set(task);

    task.on(
      'state_changed',
      (snapshot: UploadTaskSnapshot) => {
        const progressData: UploadProgress = {
          bytesTransferred: snapshot.bytesTransferred,
          totalBytes: snapshot.totalBytes,
          percentage: (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        };
        
        progress.set(progressData);
        
        if (options.onProgress) {
          options.onProgress(progressData);
        }

        switch (snapshot.state) {
          case 'paused':
            status.set('paused');
            break;
          case 'running':
            status.set('loading');
            break;
        }
      },
      (err) => {
        status.set('error');
        error.set(err.message);
        progress.set(null);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(task.snapshot.ref);
          const fileData: StorageFile = {
            name: file.name,
            fullPath: task.snapshot.ref.fullPath,
            size: file.size,
            contentType: file.type,
            timeCreated: new Date(),
            updated: new Date(),
            downloadURL
          };
          
          data.set(fileData);
          status.set('success');
          progress.set(null);
        } catch (err: any) {
          status.set('error');
          error.set(err.message);
        }
      }
    );
  };

  const pause = () => {
    const task = uploadTask();
    if (task) {
      task.pause();
    }
  };

  const resume = () => {
    const task = uploadTask();
    if (task) {
      task.resume();
    }
  };

  const cancel = () => {
    const task = uploadTask();
    if (task) {
      task.cancel();
      status.set('cancelled');
      progress.set(null);
    }
  };

  // Cleanup on destroy
  destroyRef.onDestroy(() => {
    const task = uploadTask();
    if (task) {
      task.cancel();
    }
  });

  return {
    data,
    status,
    error,
    progress,
    uploadTask,
    startUpload,
    pause,
    resume,
    cancel
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
      const metadata = await storageRef.getMetadata();
      
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
export function listFiles(
  path: string,
  options: ListOptions = {}
) {
  const data = signal<{ files: StorageFile[]; folders: string[] }>({ files: [], folders: [] });
  const status = signal<StorageStatus>('idle');
  const error = signal<string | null>(null);
  const hasMore = signal<boolean>(false);

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
          const metadata = await itemRef.getMetadata();
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

      // Process folders
      const folders = result.prefixes.map(prefix => prefix.name);

      data.set({ files, folders });
      hasMore.set(result.items.length > 0 || result.prefixes.length > 0);
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
    hasMore,
    list
  };
}

// Delete file function
export function deleteFile(path: string) {
  const status = signal<StorageStatus>('idle');
  const error = signal<string | null>(null);

  const storage = inject(FIREBASE_STORAGE);

  const deleteFile = async () => {
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
    deleteFile
  };
}

// Helper function to get file extension
export function getFileExtension(filename: string): string {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
}

// Helper function to format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
