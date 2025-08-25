# Examples

This document provides practical examples of how to use the ng-firebase-signals library in real Angular applications.

## Basic Setup

First, configure Firebase in your app:

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideFirebase } from '@ng-firebase-signals/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideFirebase({
      apiKey: 'your-api-key',
      authDomain: 'your-project.firebaseapp.com',
      projectId: 'your-project-id',
      storageBucket: 'your-project.appspot.com',
      messagingSenderId: '123456789',
      appId: 'your-app-id',
      googleAI: {
        apiKey: 'your-google-ai-key'
      }
    })
  ]
};
```

## Authentication Examples

### Simple Login Component

```typescript
// login.component.ts
import { Component } from '@angular/core';
import { initializeAuth, signInWithGoogle, signInWithEmail, userState } from '@ng-firebase-signals/core';

@Component({
  selector: 'app-login',
  template: `
    <div *ngIf="userState().isLoading">Loading...</div>
    
    <div *ngIf="!userState().isAuthenticated && !userState().isLoading">
      <h2>Sign In</h2>
      
      <button (click)="loginWithGoogle()" [disabled]="isLoading">
        {{ isLoading ? 'Signing In...' : 'Sign In with Google' }}
      </button>
      
      <form (ngSubmit)="loginWithEmail()" #loginForm="ngForm">
        <input 
          type="email" 
          [(ngModel)]="email" 
          name="email" 
          placeholder="Email" 
          required>
        
        <input 
          type="password" 
          [(ngModel)]="password" 
          name="password" 
          placeholder="Password" 
          required>
        
        <button type="submit" [disabled]="isLoading">
          {{ isLoading ? 'Signing In...' : 'Sign In' }}
        </button>
      </form>
      
      <div *ngIf="error" class="error">{{ error }}</div>
    </div>
    
    <div *ngIf="userState().isAuthenticated">
      <h2>Welcome, {{ userState().currentUser?.displayName }}!</h2>
      <button (click)="logout()">Sign Out</button>
    </div>
  `
})
export class LoginComponent {
  userState = userState;
  email = '';
  password = '';
  isLoading = false;
  error = '';
  
  constructor() {
    initializeAuth();
  }
  
  async loginWithGoogle() {
    this.isLoading = true;
    this.error = '';
    
    try {
      await signInWithGoogle();
    } catch (error: any) {
      this.error = error.message;
    } finally {
      this.isLoading = false;
    }
  }
  
  async loginWithEmail() {
    if (!this.email || !this.password) return;
    
    this.isLoading = true;
    this.error = '';
    
    try {
      await signInWithEmail(this.email, this.password);
    } catch (error: any) {
      this.error = error.message;
    } finally {
      this.isLoading = false;
    }
  }
  
  async logout() {
    try {
      await signOut();
    } catch (error: any) {
      console.error('Logout failed:', error);
    }
  }
}
```

### User Profile Management

```typescript
// profile.component.ts
import { Component } from '@angular/core';
import { userState, updateUserProfile, changePassword } from '@ng-firebase-signals/core';

@Component({
  selector: 'app-profile',
  template: `
    <div *ngIf="userState().currentUser">
      <h2>Profile</h2>
      
      <form (ngSubmit)="updateProfile()" #profileForm="ngForm">
        <div>
          <label>Display Name:</label>
          <input 
            type="text" 
            [(ngModel)]="displayName" 
            name="displayName" 
            [value]="userState().currentUser?.displayName || ''">
        </div>
        
        <div>
          <label>Photo URL:</label>
          <input 
            type="url" 
            [(ngModel)]="photoURL" 
            name="photoURL" 
            [value]="userState().currentUser?.photoURL || ''">
        </div>
        
        <button type="submit" [disabled]="isUpdating">
          {{ isUpdating ? 'Updating...' : 'Update Profile' }}
        </button>
      </form>
      
      <div *ngIf="profileMessage" [class]="profileMessageClass">
        {{ profileMessage }}
      </div>
      
      <h3>Change Password</h3>
      <form (ngSubmit)="changeUserPassword()" #passwordForm="ngForm">
        <div>
          <label>New Password:</label>
          <input 
            type="password" 
            [(ngModel)]="newPassword" 
            name="newPassword" 
            required>
        </div>
        
        <button type="submit" [disabled]="isChangingPassword">
          {{ isChangingPassword ? 'Changing...' : 'Change Password' }}
        </button>
      </form>
      
      <div *ngIf="passwordMessage" [class]="passwordMessageClass">
        {{ passwordMessage }}
      </div>
    </div>
  `
})
export class ProfileComponent {
  userState = userState;
  displayName = '';
  photoURL = '';
  newPassword = '';
  isUpdating = false;
  isChangingPassword = false;
  profileMessage = '';
  profileMessageClass = '';
  passwordMessage = '';
  passwordMessageClass = '';
  
  async updateProfile() {
    this.isUpdating = true;
    this.profileMessage = '';
    
    try {
      await updateUserProfile(this.displayName, this.photoURL);
      this.profileMessage = 'Profile updated successfully!';
      this.profileMessageClass = 'success';
    } catch (error: any) {
      this.profileMessage = `Update failed: ${error.message}`;
      this.profileMessageClass = 'error';
    } finally {
      this.isUpdating = false;
    }
  }
  
  async changeUserPassword() {
    if (!this.newPassword) return;
    
    this.isChangingPassword = true;
    this.passwordMessage = '';
    
    try {
      await changePassword(this.newPassword);
      this.passwordMessage = 'Password changed successfully!';
      this.passwordMessageClass = 'success';
      this.newPassword = '';
    } catch (error: any) {
      this.passwordMessage = `Password change failed: ${error.message}`;
      this.passwordMessageClass = 'error';
    } finally {
      this.isChangingPassword = false;
    }
  }
}
```

## Firestore Examples

### Real-time Document Listener

```typescript
// user-profile.component.ts
import { Component, inject, DestroyRef } from '@angular/core';
import { docData } from '@ng-firebase-signals/core';
import { userState } from '@ng-firebase-signals/core';

@Component({
  selector: 'app-user-profile',
  template: `
    <div *ngIf="userState().currentUser">
      <h2>User Profile</h2>
      
      <div *ngIf="profileData() as profile; else loading">
        <p><strong>Name:</strong> {{ profile.displayName }}</p>
        <p><strong>Email:</strong> {{ profile.email }}</p>
        <p><strong>Created:</strong> {{ profile.createdAt | date }}</p>
        <p><strong>Last Login:</strong> {{ profile.lastLogin | date }}</p>
      </div>
      
      <ng-template #loading>
        <p>Loading profile...</p>
      </ng-template>
    </div>
  `
})
export class UserProfileComponent {
  userState = userState;
  destroyRef = inject(DestroyRef);
  
  profileData = docData(
    `users/${this.userState().currentUser?.uid}`,
    { destroyRef: this.destroyRef }
  );
}
```

### Collection with Query

```typescript
// posts.component.ts
import { Component, inject, DestroyRef } from '@angular/core';
import { collectionData, createQuery, whereField, orderByField, limitResults } from '@ng-firebase-signals/core';

@Component({
  selector: 'app-posts',
  template: `
    <h2>Recent Posts</h2>
    
    <div *ngFor="let post of posts()" class="post">
      <h3>{{ post.title }}</h3>
      <p>{{ post.content }}</p>
      <small>By {{ post.author }} on {{ post.createdAt | date }}</small>
    </div>
    
    <div *ngIf="posts().length === 0">
      No posts found.
    </div>
  `
})
export class PostsComponent {
  destroyRef = inject(DestroyRef);
  
  posts = collectionData(
    'posts',
    createQuery(
      whereField('published', '==', true),
      orderByField('createdAt', 'desc'),
      limitResults(10)
    ),
    { destroyRef: this.destroyRef }
  );
}
```

## Storage Examples

### File Upload with Progress

```typescript
// file-upload.component.ts
import { Component } from '@angular/core';
import { uploadFile } from '@ng-firebase-signals/core';

@Component({
  selector: 'app-file-upload',
  template: `
    <div class="upload-section">
      <input 
        type="file" 
        (change)="onFileSelected($event)" 
        accept="image/*,video/*"
        #fileInput>
      
      <button (click)="fileInput.click()" [disabled]="isUploading">
        Select File
      </button>
      
      <button 
        (click)="uploadSelectedFile()" 
        [disabled]="!selectedFile || isUploading">
        {{ isUploading ? 'Uploading...' : 'Upload' }}
      </button>
    </div>
    
    <div *ngIf="uploadProgress() > 0 && uploadProgress() < 100" class="progress">
      <div class="progress-bar" [style.width.%]="uploadProgress()"></div>
      <span>{{ uploadProgress() | number:'1.0-0' }}%</span>
    </div>
    
    <div *ngIf="uploadStatus() === 'success'" class="success">
      File uploaded successfully!
    </div>
    
    <div *ngIf="uploadStatus() === 'error'" class="error">
      Upload failed: {{ uploadError() }}
    </div>
  `
})
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
// file-manager.component.ts
import { Component, inject, DestroyRef } from '@angular/core';
import { listFiles, downloadFile } from '@ng-firebase-signals/core';

@Component({
  selector: 'app-file-manager',
  template: `
    <h2>Files</h2>
    
    <div *ngFor="let file of files()" class="file-item">
      <span>{{ file.name }}</span>
      <span>{{ file.size | fileSize }}</span>
      <span>{{ file.updated | date }}</span>
      
      <button (click)="downloadFile(file.fullPath)">
        Download
      </button>
    </div>
    
    <div *ngIf="files().length === 0">
      No files found.
    </div>
  `
})
export class FileManagerComponent {
  destroyRef = inject(DestroyRef);
  
  files = listFiles('uploads/', { destroyRef: this.destroyRef });
  
  async downloadFile(path: string) {
    try {
      const download = downloadFile(path);
      await download.download();
      
      // The download.data() signal will contain the file info
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
}
```

## AI Examples

### Text Generation

```typescript
// ai-chat.component.ts
import { Component } from '@angular/core';
import { generateText, createChat } from '@ng-firebase-signals/core';

@Component({
  selector: 'app-ai-chat',
  template: `
    <div class="chat-container">
      <div class="messages">
        <div *ngFor="let message of messages" 
             [class]="message.role === 'user' ? 'user-message' : 'ai-message'">
          <strong>{{ message.role === 'user' ? 'You' : 'AI' }}:</strong>
          {{ message.content }}
        </div>
      </div>
      
      <div class="input-section">
        <textarea 
          [(ngModel)]="userInput" 
          placeholder="Type your message..."
          rows="3">
        </textarea>
        
        <button (click)="sendMessage()" [disabled]="isGenerating">
          {{ isGenerating ? 'Generating...' : 'Send' }}
        </button>
      </div>
    </div>
  `
})
export class AIChatComponent {
  userInput = '';
  messages: Array<{ role: 'user' | 'ai', content: string }> = [];
  isGenerating = false;
  
  async sendMessage() {
    if (!this.userInput.trim() || this.isGenerating) return;
    
    const userMessage = this.userInput.trim();
    this.messages.push({ role: 'user', content: userMessage });
    this.userInput = '';
    this.isGenerating = true;
    
    try {
      const response = await generateText(userMessage, {
        model: 'gemini-pro',
        temperature: 0.7
      });
      
      this.messages.push({ role: 'ai', content: response.text });
    } catch (error: any) {
      this.messages.push({ role: 'ai', content: `Error: ${error.message}` });
    } finally {
      this.isGenerating = false;
    }
  }
}
```

### Streaming Chat

```typescript
// streaming-chat.component.ts
import { Component } from '@angular/core';
import { generateTextStream } from '@ng-firebase-signals/core';

@Component({
  selector: 'app-streaming-chat',
  template: `
    <div class="chat-container">
      <div class="messages">
        <div *ngFor="let message of messages" class="message">
          <strong>{{ message.role }}:</strong>
          <span [innerHTML]="message.content"></span>
        </div>
      </div>
      
      <div class="input-section">
        <textarea 
          [(ngModel)]="userInput" 
          placeholder="Ask me anything..."
          rows="3">
        </textarea>
        
        <button (click)="startStreaming()" [disabled]="isStreaming">
          {{ isStreaming ? 'Streaming...' : 'Start Streaming' }}
        </button>
      </div>
    </div>
  `
})
export class StreamingChatComponent {
  userInput = '';
  messages: Array<{ role: string, content: string }> = [];
  isStreaming = false;
  
  async startStreaming() {
    if (!this.userInput.trim() || this.isStreaming) return;
    
    const userMessage = this.userInput.trim();
    this.messages.push({ role: 'User', content: userMessage });
    this.userInput = '';
    this.isStreaming = true;
    
    try {
      const stream = generateTextStream(userMessage, {
        model: 'gemini-pro',
        temperature: 0.8
      });
      
      let aiResponse = '';
      this.messages.push({ role: 'AI', content: aiResponse });
      
      for await (const chunk of stream) {
        aiResponse += chunk.text;
        // Update the last message
        this.messages[this.messages.length - 1].content = aiResponse;
      }
    } catch (error: any) {
      this.messages.push({ role: 'AI', content: `Error: ${error.message}` });
    } finally {
      this.isStreaming = false;
    }
  }
}
```

## Complete App Example

Here's a complete example showing how to integrate multiple features:

```typescript
// app.component.ts
import { Component } from '@angular/core';
import { initializeAuth, userState, signOut } from '@ng-firebase-signals/core';

@Component({
  selector: 'app-root',
  template: `
    <nav>
      <h1>My App</h1>
      <div *ngIf="userState().isAuthenticated">
        <span>Welcome, {{ userState().currentUser?.displayName }}</span>
        <button (click)="logout()">Sign Out</button>
      </div>
    </nav>
    
    <main>
      <router-outlet></router-outlet>
    </main>
  `
})
export class AppComponent {
  userState = userState;
  
  constructor() {
    initializeAuth();
  }
  
  async logout() {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }
}
```

## Best Practices

1. **Error Handling**: Always wrap async operations in try-catch blocks
2. **Loading States**: Use the status signals to show loading indicators
3. **Cleanup**: The library automatically handles cleanup when components are destroyed
4. **Type Safety**: All functions are fully typed for better development experience
5. **Reactive Updates**: Use the signal values directly in templates for automatic updates
6. **Performance**: Functions are optimized and only create subscriptions when needed
