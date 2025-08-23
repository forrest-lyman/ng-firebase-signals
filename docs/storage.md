# Storage

The Storage module provides reactive file management, upload/download operations, and progress tracking using Angular signals.

## Overview

Each Storage function is focused and does one specific thing, returning reactive signals for file operations. This approach provides clean separation of concerns and better composability.

## Core Functions

### File Upload

#### `uploadFile(path: string, file: File, options?: UploadOptions)`

Creates a reactive file upload operation with progress tracking, pause/resume, and cancel functionality.

```typescript
import { uploadFile } from 'ng-firebase-signals';

@Component({...})
export class FileUploadComponent {
  fileUpload = uploadFile('uploads/document.pdf', file);
  
  // Access reactive state
  data = this.fileUpload.data;
  status = this.fileUpload.status;
  error = this.fileUpload.error;
  progress = this.fileUpload.progress;
  uploadTask = this.fileUpload.uploadTask;
}
```

**Parameters:**
- `path` - Storage path where the file will be uploaded
- `file` - File object to upload
- `options` - Optional configuration including metadata and progress callback

**Returns:**
- `data` - Signal containing the uploaded file information
- `status` - Signal with current upload status
- `error` - Signal containing any errors
- `progress` - Signal with upload progress information
- `uploadTask` - Signal containing the Firebase upload task
- `startUpload()` - Function to start the upload
- `pause()` - Function to pause the upload
- `resume()` - Function to resume the upload
- `cancel()` - Function to cancel the upload

**Template Usage:**
```html
<div class="file-upload">
  <input type="file" (change)="onFileSelected($event)">
  
  <div *ngIf="fileUpload.status() === 'loading'" class="upload-progress">
    <div class="progress-bar">
      <div 
        class="progress-fill" 
        [style.width.%]="fileUpload.progress()?.percentage || 0">
      </div>
    </div>
    <p>{{ fileUpload.progress()?.bytesTransferred | fileSize }} / {{ fileUpload.progress()?.totalBytes | fileSize }}</p>
    <p>{{ fileUpload.progress()?.percentage | number:'1.0-1' }}%</p>
  </div>
  
  <div *ngIf="fileUpload.status() === 'paused'" class="upload-paused">
    Upload paused
  </div>
  
  <div *ngIf="fileUpload.status() === 'success'" class="upload-success">
    File uploaded successfully!
    <p>Download URL: {{ fileUpload.data()?.downloadURL }}</p>
  </div>
  
  <div *ngIf="fileUpload.error()" class="upload-error">
    Error: {{ fileUpload.error() }}
  </div>
  
  <div class="upload-controls">
    <button 
      *ngIf="fileUpload.status() === 'idle'"
      (click)="fileUpload.startUpload()">
      Start Upload
    </button>
    
    <button 
      *ngIf="fileUpload.status() === 'loading'"
      (click)="fileUpload.pause()">
      Pause
    </button>
    
    <button 
      *ngIf="fileUpload.status() === 'paused'"
      (click)="fileUpload.resume()">
      Resume
    </button>
    
    <button 
      *ngIf="fileUpload.status() === 'loading' || fileUpload.status() === 'paused'"
      (click)="fileUpload.cancel()">
      Cancel
    </button>
  </div>
</div>
```

### File Download

#### `downloadFile(path: string)`

Creates a reactive file download operation.

```typescript
import { downloadFile } from 'ng-firebase-signals';

@Component({...})
export class FileDownloadComponent {
  fileDownload = downloadFile('uploads/document.pdf');
  
  // Access reactive state
  data = this.fileDownload.data;
  status = this.fileDownload.status;
  error = this.fileDownload.error;
}
```

**Parameters:**
- `path` - Storage path of the file to download

**Returns:**
- `data` - Signal containing download URL and file metadata
- `status` - Signal with current download status
- `error` - Signal containing any errors
- `download()` - Function to trigger the download

**Template Usage:**
```html
<div class="file-download">
  <button 
    (click)="fileDownload.download()"
    [disabled]="fileDownload.status() === 'loading'">
    {{ fileDownload.status() === 'loading' ? 'Downloading...' : 'Download File' }}
  </button>
  
  <div *ngIf="fileDownload.data()" class="download-info">
    <p>Download URL: {{ fileDownload.data()?.url }}</p>
    <p>File Name: {{ fileDownload.data()?.file.name }}</p>
    <p>File Size: {{ fileDownload.data()?.file.size | fileSize }}</p>
    <a [href]="fileDownload.data()?.url" target="_blank">Open File</a>
  </div>
  
  <div *ngIf="fileDownload.error()" class="download-error">
    Error: {{ fileDownload.error() }}
  </div>
</div>
```

### File Listing

#### `listFiles(path: string, options?: ListOptions)`

Creates a reactive file listing operation for a storage path.

```typescript
import { listFiles } from 'ng-firebase-signals';

@Component({...})
export class FileListComponent {
  fileList = listFiles('uploads/');
  
  // Access reactive state
  data = this.fileList.data;
  status = this.fileList.status;
  error = this.fileList.error;
  hasMore = this.fileList.hasMore;
}
```

**Parameters:**
- `path` - Storage path to list files from
- `options` - Optional configuration including max results and pagination

**Returns:**
- `data` - Signal containing files and folders arrays
- `status` - Signal with current operation status
- `error` - Signal containing any errors
- `hasMore` - Signal indicating if there are more files to load
- `list()` - Function to trigger the listing operation

**Template Usage:**
```html
<div class="file-list">
  <button (click)="fileList.list()">Refresh Files</button>
  
  <div *ngIf="fileList.data()?.folders.length" class="folders">
    <h3>Folders</h3>
    <div *ngFor="let folder of fileList.data()?.folders" class="folder-item">
      📁 {{ folder }}
    </div>
  </div>
  
  <div *ngIf="fileList.data()?.files.length" class="files">
    <h3>Files</h3>
    <div *ngFor="let file of fileList.data()?.files" class="file-item">
      <span class="file-icon">📄</span>
      <span class="file-name">{{ file.name }}</span>
      <span class="file-size">{{ file.size | fileSize }}</span>
      <span class="file-date">{{ file.updated | date:'short' }}</span>
      <a [href]="file.downloadURL" target="_blank">Download</a>
    </div>
  </div>
  
  <div *ngIf="fileList.status() === 'loading'" class="loading">
    Loading files...
  </div>
  
  <div *ngIf="fileList.error()" class="error">
    Error: {{ fileList.error() }}
  </div>
</div>
```

### File Deletion

#### `deleteFile(path: string)`

Creates a reactive file deletion operation.

```typescript
import { deleteFile } from 'ng-firebase-signals';

@Component({...})
export class FileDeleteComponent {
  fileDeletion = deleteFile('uploads/old-file.pdf');
  
  // Access reactive state
  status = this.fileDeletion.status;
  error = this.fileDeletion.error;
}
```

**Parameters:**
- `path` - Storage path of the file to delete

**Returns:**
- `status` - Signal with current operation status
- `error` - Signal containing any errors
- `deleteFile()` - Function to trigger the deletion

**Template Usage:**
```html
<div class="file-delete">
  <button 
    (click)="fileDeletion.deleteFile()"
    [disabled]="fileDeletion.status() === 'loading'">
    {{ fileDeletion.status() === 'loading' ? 'Deleting...' : 'Delete File' }}
  </button>
  
  <div *ngIf="fileDeletion.status() === 'success'" class="delete-success">
    File deleted successfully!
  </div>
  
  <div *ngIf="fileDeletion.error()" class="delete-error">
    Error: {{ fileDeletion.error() }}
  </div>
</div>
```

## Helper Functions

### File Utilities

#### `getFileExtension(filename: string): string`

Extracts the file extension from a filename.

```typescript
import { getFileExtension } from 'ng-firebase-signals';

@Component({...})
export class FileComponent {
  getExtension(filename: string) {
    const ext = getFileExtension(filename);
    console.log(`File extension: ${ext}`);
    return ext;
  }
}

// Examples:
getFileExtension('document.pdf'); // Returns: 'pdf'
getFileExtension('image.jpg'); // Returns: 'jpg'
getFileExtension('archive.tar.gz'); // Returns: 'gz'
getFileExtension('no-extension'); // Returns: ''
```

#### `formatFileSize(bytes: number): string`

Formats file size in human-readable format.

```typescript
import { formatFileSize } from 'ng-firebase-signals';

@Component({...})
export class FileComponent {
  formatSize(bytes: number) {
    const size = formatFileSize(bytes);
    console.log(`File size: ${size}`);
    return size;
  }
}

// Examples:
formatFileSize(0); // Returns: '0 Bytes'
formatFileSize(1024); // Returns: '1 KB'
formatFileSize(1048576); // Returns: '1 MB'
formatFileSize(1073741824); // Returns: '1 GB'
```

## Advanced Usage

### Upload with Custom Metadata

```typescript
import { uploadFile } from 'ng-firebase-signals';

@Component({...})
export class AdvancedUploadComponent {
  uploadWithMetadata = uploadFile(
    'uploads/document.pdf',
    file,
    {
      metadata: {
        contentType: 'application/pdf',
        customMetadata: {
          uploadedBy: 'user123',
          category: 'documents',
          tags: 'important,work'
        }
      },
      onProgress: (progress) => {
        console.log(`Upload progress: ${progress.percentage}%`);
      }
    }
  );
}
```

### Multiple File Uploads

```typescript
import { uploadFile } from 'ng-firebase-signals';

@Component({...})
export class MultipleUploadComponent {
  uploads: any[] = [];
  
  onFilesSelected(event: any) {
    const files = event.target.files;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const path = `uploads/${Date.now()}-${file.name}`;
      
      const upload = uploadFile(path, file);
      this.uploads.push(upload);
      
      // Start upload immediately
      upload.startUpload();
    }
  }
  
  getTotalProgress() {
    if (this.uploads.length === 0) return 0;
    
    const totalProgress = this.uploads.reduce((sum, upload) => {
      const progress = upload.progress();
      return sum + (progress ? progress.percentage : 0);
    }, 0);
    
    return totalProgress / this.uploads.length;
  }
}
```

**Template Usage:**
```html
<div class="multiple-uploads">
  <input type="file" multiple (change)="onFilesSelected($event)">
  
  <div class="total-progress">
    Total Progress: {{ getTotalProgress() | number:'1.0-1' }}%
  </div>
  
  <div *ngFor="let upload of uploads; let i = index" class="upload-item">
    <h4>File {{ i + 1 }}</h4>
    
    <div *ngIf="upload.progress()" class="progress">
      {{ upload.progress()?.percentage | number:'1.0-1' }}%
    </div>
    
    <div *ngIf="upload.status() === 'success'" class="success">
      ✓ Uploaded
    </div>
    
    <div *ngIf="upload.error()" class="error">
      ✗ {{ upload.error() }}
    </div>
  </div>
</div>
```

### File Management Dashboard

```typescript
import { 
  uploadFile, 
  listFiles, 
  deleteFile,
  downloadFile 
} from 'ng-firebase-signals';

@Component({...})
export class FileDashboardComponent {
  // File operations
  fileUpload = uploadFile('uploads/', null);
  fileList = listFiles('uploads/');
  fileDeletion = deleteFile('');
  fileDownload = downloadFile('');
  
  // File selection
  selectedFile: any = null;
  
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.fileUpload = uploadFile(`uploads/${file.name}`, file);
      this.fileUpload.startUpload();
    }
  }
  
  onFileDelete(path: string) {
    this.fileDeletion = deleteFile(path);
    this.fileDeletion.deleteFile().then(() => {
      // Refresh file list after deletion
      this.fileList.list();
    });
  }
  
  onFileDownload(path: string) {
    this.fileDownload = downloadFile(path);
    this.fileDownload.download();
  }
  
  onFileSelect(file: any) {
    this.selectedFile = file;
  }
}
```

**Template Usage:**
```html
<div class="file-dashboard">
  <!-- Upload Section -->
  <div class="upload-section">
    <h3>Upload Files</h3>
    <input type="file" (change)="onFileSelected($event)">
    
    <div *ngIf="fileUpload.progress()" class="upload-progress">
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          [style.width.%]="fileUpload.progress()?.percentage || 0">
        </div>
      </div>
      <p>{{ fileUpload.progress()?.percentage | number:'1.0-1' }}%</p>
    </div>
  </div>
  
  <!-- File List Section -->
  <div class="file-list-section">
    <h3>Files</h3>
    <button (click)="fileList.list()">Refresh</button>
    
    <div *ngFor="let file of fileList.data()?.files" 
         class="file-item"
         [class.selected]="selectedFile === file"
         (click)="onFileSelect(file)">
      
      <div class="file-info">
        <span class="file-name">{{ file.name }}</span>
        <span class="file-size">{{ file.size | fileSize }}</span>
        <span class="file-date">{{ file.updated | date:'short' }}</span>
      </div>
      
      <div class="file-actions">
        <button (click)="onFileDownload(file.fullPath)">Download</button>
        <button (click)="onFileDelete(file.fullPath)" class="delete-btn">Delete</button>
      </div>
    </div>
  </div>
  
  <!-- File Details Section -->
  <div *ngIf="selectedFile" class="file-details">
    <h3>File Details</h3>
    <p><strong>Name:</strong> {{ selectedFile.name }}</p>
    <p><strong>Path:</strong> {{ selectedFile.fullPath }}</p>
    <p><strong>Size:</strong> {{ selectedFile.size | fileSize }}</p>
    <p><strong>Type:</strong> {{ selectedFile.contentType }}</p>
    <p><strong>Created:</strong> {{ selectedFile.timeCreated | date:'medium' }}</p>
    <p><strong>Updated:</strong> {{ selectedFile.updated | date:'medium' }}</p>
    <p><strong>Download URL:</strong> 
      <a [href]="selectedFile.downloadURL" target="_blank">{{ selectedFile.downloadURL }}</a>
    </p>
  </div>
</div>
```

## Complete Example

```typescript
import { Component, inject } from '@angular/core';
import { 
  uploadFile, 
  listFiles, 
  deleteFile,
  downloadFile,
  getFileExtension,
  formatFileSize 
} from 'ng-firebase-signals';

@Component({
  selector: 'app-file-manager',
  template: `
    <div class="file-manager">
      <!-- Upload Area -->
      <div class="upload-area">
        <h2>Upload Files</h2>
        <input type="file" (change)="onFileSelected($event)">
        
        <div *ngIf="currentUpload.progress()" class="upload-progress">
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              [style.width.%]="currentUpload.progress()?.percentage || 0">
            </div>
          </div>
          <p>{{ currentUpload.progress()?.percentage | number:'1.0-1' }}%</p>
          <p>{{ currentUpload.progress()?.bytesTransferred | fileSize }} / {{ currentUpload.progress()?.totalBytes | fileSize }}</p>
        </div>
        
        <div *ngIf="currentUpload.status() === 'success'" class="upload-success">
          ✓ File uploaded successfully!
        </div>
        
        <div *ngIf="currentUpload.error()" class="upload-error">
          ✗ Error: {{ currentUpload.error() }}
        </div>
      </div>
      
      <!-- File List -->
      <div class="file-list">
        <h2>Files</h2>
        <button (click)="refreshFiles()">Refresh</button>
        
        <div *ngFor="let file of files.data()?.files" class="file-item">
          <div class="file-icon">
            {{ getFileIcon(file.name) }}
          </div>
          
          <div class="file-details">
            <h4>{{ file.name }}</h4>
            <p>{{ file.size | fileSize }} • {{ file.updated | date:'short' }}</p>
            <p class="file-path">{{ file.fullPath }}</p>
          </div>
          
          <div class="file-actions">
            <button (click)="downloadFile(file.fullPath)">Download</button>
            <button (click)="deleteFile(file.fullPath)" class="delete-btn">Delete</button>
          </div>
        </div>
        
        <div *ngIf="files.status() === 'loading'" class="loading">
          Loading files...
        </div>
        
        <div *ngIf="files.error()" class="error">
          Error: {{ files.error() }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .file-manager {
      padding: 20px;
    }
    
    .upload-area {
      margin-bottom: 30px;
      padding: 20px;
      border: 2px dashed #ccc;
      border-radius: 8px;
      text-align: center;
    }
    
    .progress-bar {
      width: 100%;
      height: 20px;
      background: #f0f0f0;
      border-radius: 10px;
      overflow: hidden;
      margin: 10px 0;
    }
    
    .progress-fill {
      height: 100%;
      background: #4CAF50;
      transition: width 0.3s ease;
    }
    
    .file-item {
      display: flex;
      align-items: center;
      padding: 15px;
      border: 1px solid #eee;
      border-radius: 8px;
      margin-bottom: 10px;
    }
    
    .file-icon {
      font-size: 24px;
      margin-right: 15px;
    }
    
    .file-details {
      flex: 1;
    }
    
    .file-path {
      color: #666;
      font-size: 12px;
    }
    
    .file-actions button {
      margin-left: 10px;
    }
    
    .delete-btn {
      background: #f44336;
      color: white;
    }
  `]
})
export class FileManagerComponent {
  // File operations
  currentUpload = uploadFile('uploads/', null);
  files = listFiles('uploads/');
  currentDeletion = deleteFile('');
  currentDownload = downloadFile('');
  
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const path = `uploads/${Date.now()}-${file.name}`;
      this.currentUpload = uploadFile(path, file);
      this.currentUpload.startUpload();
    }
  }
  
  refreshFiles() {
    this.files.list();
  }
  
  downloadFile(path: string) {
    this.currentDownload = downloadFile(path);
    this.currentDownload.download();
  }
  
  deleteFile(path: string) {
    this.currentDeletion = deleteFile(path);
    this.currentDeletion.deleteFile().then(() => {
      this.refreshFiles();
    });
  }
  
  getFileIcon(filename: string): string {
    const ext = getFileExtension(filename).toLowerCase();
    
    switch (ext) {
      case 'pdf': return '📄';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return '🖼️';
      case 'doc':
      case 'docx': return '📝';
      case 'xls':
      case 'xlsx': return '📊';
      case 'zip':
      case 'rar': return '📦';
      default: return '📁';
    }
  }
}
```

## Best Practices

1. **Compose Functions**: Mix and match storage functions as needed
2. **Handle Progress**: Always show upload progress for better user experience
3. **Error Handling**: Display error signals for better user experience
4. **File Validation**: Validate file types and sizes before upload
5. **Cleanup**: Functions automatically clean up when components are destroyed
6. **Security**: Implement proper storage security rules
7. **Performance**: Use appropriate chunk sizes for large files

## Status Types

All storage functions return a consistent status pattern:

```typescript
export type StorageStatus = 'idle' | 'loading' | 'success' | 'error' | 'paused' | 'cancelled';
```

- `idle` - Operation hasn't started
- `loading` - Operation in progress
- `success` - Operation completed successfully
- `error` - Operation failed with an error
- `paused` - Upload operation is paused
- `cancelled` - Operation was cancelled

## Error Handling

All storage functions provide error signals that you can use to display user-friendly error messages:

```typescript
// Check for errors
if (fileUpload.error()) {
  console.error('Upload failed:', fileUpload.error());
}

// Display in template
<div *ngIf="fileUpload.error()" class="error-message">
  {{ fileUpload.error() }}
</div>
```

## Security Considerations

- Always validate file types and sizes
- Implement proper storage security rules
- Use HTTPS in production
- Consider implementing virus scanning for uploaded files
- Set appropriate CORS policies
- Implement rate limiting for uploads

## Storage Security Rules

Remember to set up proper Firebase Storage security rules:

```javascript
// Example storage security rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Users can upload to their own folder
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Public files can be read by anyone
    match /public/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Admin files require admin role
    match /admin/{allPaths=**} {
      allow read, write: if request.auth != null && 
        get(/databases/$(request.auth.token.database_id)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```
