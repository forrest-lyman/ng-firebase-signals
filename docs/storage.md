# Storage

The storage module provides reactive Firebase Storage operations using Angular signals.

## Quick Start

```typescript
import { provideFirebase } from '@ng-firebase-signals/core';
import { uploadFile, downloadFile, listFiles, deleteFile } from '@ng-firebase-signals/core';

// In your app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideFirebase({
      // your Firebase config
    })
  ]
};

// In your component
export class StorageComponent {
  async uploadFile(file: File) {
    const upload = uploadFile('uploads/');
    await upload.upload(file);
  }
}
```

## Functions

### File Upload

#### `uploadFile(path: string)`

Creates an upload function for the specified storage path.

**Returns:**
- `data` - Signal containing upload result (download URL and file metadata)
- `progress` - Signal containing upload progress information
- `status` - Signal with current upload status
- `error` - Signal containing any upload errors
- `upload(file: File)` - Function to start the upload

**Usage:**
```typescript
const upload = uploadFile('uploads/');

// Start upload
await upload.upload(file);

// Monitor progress
const progress = upload.progress();
if (progress()) {
  console.log(`Uploaded: ${progress()?.percentage}%`);
}

// Check status
if (upload.status() === 'success') {
  const result = upload.data();
  console.log('Download URL:', result?.downloadURL);
}
```

### File Download

#### `downloadFile(path: string)`

Creates a download function for the specified file path.

**Returns:**
- `data` - Signal containing download result (URL and file metadata)
- `status` - Signal with current download status
- `error` - Signal containing any download errors
- `download()` - Function to start the download

**Usage:**
```typescript
const download = downloadFile('uploads/document.pdf');

// Start download
await download.download();

// Get file info
const fileData = download.data();
if (fileData) {
  console.log('File size:', fileData.file.size);
  console.log('Download URL:', fileData.url);
}
```

### File Listing

#### `listFiles(path: string, options?: { destroyRef?: DestroyRef })`

Lists all files in the specified storage path.

**Returns:**
- `data` - Signal containing array of file information
- `status` - Signal with current listing status
- `error` - Signal containing any listing errors
- `list()` - Function to refresh the file list

**Usage:**
```typescript
export class FileListComponent {
  destroyRef = inject(DestroyRef);
  
  files = listFiles('uploads/', { destroyRef: this.destroyRef });
  
  // Access file data
  get fileList() {
    return this.files.data();
  }
  
  // Refresh list
  async refreshFiles() {
    await this.files.list();
  }
}
```

### File Deletion

#### `deleteFile(path: string)`

Creates a delete function for the specified file path.

**Returns:**
- `status` - Signal with current deletion status
- `error` - Signal containing any deletion errors
- `deleteFile()` - Function to delete the file

**Usage:**
```typescript
const deleteAction = deleteFile('uploads/old-file.pdf');

// Delete file
await deleteAction.deleteFile();

// Check status
if (deleteAction.status() === 'success') {
  console.log('File deleted successfully');
}
```

## Types

### `StorageStatus`
```typescript
export type StorageStatus = 'idle' | 'loading' | 'success' | 'error';
```

### `StorageFile`
```typescript
export interface StorageFile {
  name: string;
  fullPath: string;
  size: number;
  contentType: string;
  timeCreated?: Date;
  updated?: Date;
  downloadURL: string;
}
```

### `UploadProgress`
```typescript
export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
}
```

## Usage Examples

### File Upload with Progress

```typescript
export class FileUploadComponent {
  selectedFile: File | null = null;
  isUploading = false;
  
  uploadData = uploadFile('uploads/');
  
  get uploadProgress() { return this.uploadData.progress; }
  get uploadStatus() { return this.uploadData.status; }
  get uploadError() { return this.uploadData.error; }
  
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }
  
  async uploadSelectedFile() {
    if (!this.selectedFile) return;
    
    this.isUploading = true;
    
    try {
      await this.uploadData.upload(this.selectedFile);
      this.selectedFile = null;
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      this.isUploading = false;
    }
  }
}
```

### File List and Download

```typescript
export class FileManagerComponent {
  destroyRef = inject(DestroyRef);
  
  files = listFiles('uploads/', { destroyRef: this.destroyRef });
  
  async downloadFile(path: string) {
    try {
      const download = downloadFile(path);
      await download.download();
      
      const fileData = download.data();
      if (fileData) {
        // Create download link
        const link = document.createElement('a');
        link.href = fileData.url;
        link.download = fileData.file.name;
        link.click();
      }
    } catch (error) {
      console.error('Download failed:', error);
    }
  }
  
  async deleteFile(path: string) {
    try {
      const deleteAction = deleteFile(path);
      await deleteAction.deleteFile();
      
      // Refresh file list
      await this.files.list();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  }
}
```

### File Upload with Custom Path

```typescript
export class ProfilePictureUploadComponent {
  async uploadProfilePicture(file: File, userId: string) {
    const path = `users/${userId}/profile-picture`;
    const upload = uploadFile(path);
    
    try {
      await upload.upload(file);
      
      if (upload.status() === 'success') {
        const result = upload.data();
        if (result) {
          // Update user profile with new image URL
          console.log('Profile picture uploaded:', result.downloadURL);
        }
      }
    } catch (error) {
      console.error('Profile picture upload failed:', error);
    }
  }
}
```

## Best Practices

1. **Path Management**: Use consistent path structures (e.g., `users/{userId}/files/{fileName}`)
2. **Error Handling**: Always check error signals and handle failures gracefully
3. **Progress Monitoring**: Use progress signals to show upload progress to users
4. **Cleanup**: The library automatically handles cleanup when components are destroyed
5. **File Validation**: Validate file types and sizes before upload
6. **Security Rules**: Implement proper Firebase Storage security rules

## Security Considerations

- Always validate file types and sizes on the client side
- Implement proper Firebase Storage security rules
- Use authentication to control access to storage resources
- Consider implementing virus scanning for uploaded files
- Use signed URLs for sensitive file access
