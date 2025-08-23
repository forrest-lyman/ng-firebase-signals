# Examples

Practical examples and integration patterns for ng-firebase-signals.

## Basic Integration

### Simple User Profile

```typescript
import { Component, inject } from '@angular/core';
import { docData, useDocRef } from 'ng-firebase-signals';
import { createUserState } from 'ng-firebase-signals';

@Component({
  selector: 'app-user-profile',
  template: `
    <div *ngIf="authState.user()">
      <h2>{{ authState.user()?.displayName }}</h2>
      <p>{{ authState.user()?.email }}</p>
      
      <div *ngIf="userProfile.data()">
        <h3>Profile Details</h3>
        <p>Bio: {{ userProfile.data()?.bio }}</p>
        <p>Location: {{ userProfile.data()?.location }}</p>
      </div>
      
      <div *ngIf="userProfile.status() === 'loading'">Loading...</div>
      <div *ngIf="userProfile.error()">Error: {{ userProfile.error() }}</div>
    </div>
  `
})
export class UserProfileComponent {
  authState = createUserState();
  userProfile = docData(useDocRef('users/123'));
}
```

### File Upload with Progress

```typescript
import { Component } from '@angular/core';
import { uploadFile } from 'ng-firebase-signals';

@Component({
  selector: 'app-file-upload',
  template: `
    <input type="file" (change)="onFileSelected($event)">
    
    <div *ngIf="fileUpload.progress()" class="progress">
      <div class="progress-bar">
        <div [style.width.%]="fileUpload.progress()?.percentage"></div>
      </div>
      <p>{{ fileUpload.progress()?.percentage | number:'1.0-1' }}%</p>
    </div>
    
    <div *ngIf="fileUpload.status() === 'success'">
      File uploaded! URL: {{ fileUpload.data()?.downloadURL }}
    </div>
  `
})
export class FileUploadComponent {
  fileUpload = uploadFile('uploads/', null);
  
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.fileUpload = uploadFile(`uploads/${file.name}`, file);
      this.fileUpload.startUpload();
    }
  }
}
```

### AI Text Generation

```typescript
import { Component } from '@angular/core';
import { generateText } from 'ng-firebase-signals';

@Component({
  selector: 'app-ai-generator',
  template: `
    <textarea #prompt placeholder="Enter your prompt..."></textarea>
    <button (click)="generate(prompt.value)">Generate</button>
    
    <div *ngIf="textGenerator.data()">
      <h3>Generated Text:</h3>
      <p>{{ textGenerator.data()?.text }}</p>
    </div>
    
    <div *ngIf="textGenerator.status() === 'loading'">Generating...</div>
  `
})
export class AIGeneratorComponent {
  textGenerator = generateText('');
  
  async generate(prompt: string) {
    if (prompt.trim()) {
      this.textGenerator = generateText(prompt);
      await this.textGenerator.generate();
    }
  }
}
```

## Advanced Patterns

### Real-time Chat Application

```typescript
import { Component } from '@angular/core';
import { collectionData, useCollectionRef, createQuery, orderByField, limitResults } from 'ng-firebase-signals';
import { createChat } from 'ng-firebase-signals';

@Component({
  selector: 'app-chat',
  template: `
    <div class="chat-container">
      <div class="messages">
        <div *ngFor="let message of messages.data()" class="message">
          <strong>{{ message.userName }}:</strong> {{ message.text }}
        </div>
      </div>
      
      <div class="input-area">
        <input #messageInput placeholder="Type a message...">
        <button (click)="sendMessage(messageInput.value)">Send</button>
      </div>
    </div>
  `
})
export class ChatComponent {
  messages = collectionData(
    createQuery(
      useCollectionRef('messages'),
      orderByField('timestamp', 'desc'),
      limitResults(50)
    )
  );
  
  chatSession = createChat('You are a helpful assistant.');
  
  sendMessage(text: string) {
    // Implementation for sending messages
  }
}
```

### Dashboard with Multiple Data Sources

```typescript
import { Component } from '@angular/core';
import { docData, collectionData, useDocRef, useCollectionRef } from 'ng-firebase-signals';
import { listFiles } from 'ng-firebase-signals';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="dashboard">
      <div class="stats">
        <h3>User Stats</h3>
        <p>Total Users: {{ users.data()?.length || 0 }}</p>
        <p>Active Users: {{ activeUsers.data()?.length || 0 }}</p>
      </div>
      
      <div class="files">
        <h3>Recent Files</h3>
        <div *ngFor="let file of files.data()?.files" class="file-item">
          {{ file.name }} ({{ file.size | fileSize }})
        </div>
      </div>
      
      <div class="profile">
        <h3>Your Profile</h3>
        <div *ngIf="profile.data()">
          <p>{{ profile.data()?.displayName }}</p>
          <p>{{ profile.data()?.email }}</p>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent {
  users = collectionData(useCollectionRef('users'));
  activeUsers = collectionData(useCollectionRef('users'));
  files = listFiles('uploads/');
  profile = docData(useDocRef('users/current-user-id'));
}
```

### Form with Real-time Validation

```typescript
import { Component } from '@angular/core';
import { docData, useDocRef } from 'ng-firebase-signals';
import { createUser } from 'ng-firebase-signals';

@Component({
  selector: 'app-user-form',
  template: `
    <form (ngSubmit)="onSubmit()">
      <input [(ngModel)]="userData.email" name="email" type="email" placeholder="Email">
      <input [(ngModel)]="userData.password" name="password" type="password" placeholder="Password">
      
      <button type="submit" [disabled]="userCreation.status() === 'loading'">
        {{ userCreation.status() === 'loading' ? 'Creating...' : 'Create User' }}
      </button>
    </form>
    
    <div *ngIf="userCreation.error()" class="error">
      {{ userCreation.error() }}
    </div>
    
    <div *ngIf="userCreation.status() === 'success'" class="success">
      User created successfully!
    </div>
  `
})
export class UserFormComponent {
  userData = { email: '', password: '' };
  userCreation = createUser('', '');
  
  onSubmit() {
    this.userCreation = createUser(this.userData.email, this.userData.password);
    this.userCreation.create();
  }
}
```

## Integration Patterns

### Service Layer Pattern

```typescript
import { Injectable, inject } from '@angular/core';
import { docData, useDocRef, collectionData, useCollectionRef } from 'ng-firebase-signals';
import { uploadFile, listFiles } from 'ng-firebase-signals';

@Injectable({ providedIn: 'root' })
export class UserService {
  getUserProfile(userId: string) {
    return docData(useDocRef(`users/${userId}`));
  }
  
  getUsers() {
    return collectionData(useCollectionRef('users'));
  }
  
  uploadUserAvatar(userId: string, file: File) {
    return uploadFile(`users/${userId}/avatar`, file);
  }
  
  getUserFiles(userId: string) {
    return listFiles(`users/${userId}/files`);
  }
}

// Usage in component
@Component({...})
export class UserComponent {
  constructor(private userService: UserService) {}
  
  userProfile = this.userService.getUserProfile('123');
  users = this.userService.getUsers();
}
```

### State Management Pattern

```typescript
import { Injectable, signal, computed } from '@angular/core';
import { docData, useDocRef } from 'ng-firebase-signals';

@Injectable({ providedIn: 'root' })
export class AppStateService {
  private currentUser = signal<any>(null);
  private userProfile = signal<any>(null);
  
  // Computed values
  isAuthenticated = computed(() => !!this.currentUser());
  userDisplayName = computed(() => this.currentUser()?.displayName || 'Anonymous');
  
  // Firestore data
  userProfileData = docData(useDocRef('users/current-user-id'));
  
  constructor() {
    // Sync Firestore data with local state
    effect(() => {
      const profile = this.userProfileData.data();
      if (profile) {
        this.userProfile.set(profile);
      }
    });
  }
  
  setCurrentUser(user: any) {
    this.currentUser.set(user);
  }
  
  clearUser() {
    this.currentUser.set(null);
    this.userProfile.set(null);
  }
}
```

### Error Boundary Pattern

```typescript
import { Component, inject } from '@angular/core';
import { docData, useDocRef } from 'ng-firebase-signals';

@Component({
  selector: 'app-error-boundary',
  template: `
    <ng-container *ngIf="!hasError(); else errorTemplate">
      <ng-content></ng-content>
    </ng-container>
    
    <ng-template #errorTemplate>
      <div class="error-boundary">
        <h3>Something went wrong</h3>
        <p>{{ errorMessage() }}</p>
        <button (click)="retry()">Retry</button>
      </div>
    </ng-template>
  `
})
export class ErrorBoundaryComponent {
  private hasError = signal(false);
  private errorMessage = signal('');
  
  retry() {
    this.hasError.set(false);
    this.errorMessage.set('');
  }
  
  setError(message: string) {
    this.hasError.set(true);
    this.errorMessage.set(message);
  }
}

// Usage
@Component({
  selector: 'app-safe-component',
  template: `
    <app-error-boundary>
      <app-user-profile></app-user-profile>
    </app-error-boundary>
  `
})
export class SafeComponent {}
```

## Performance Optimization

### Lazy Loading Data

```typescript
import { Component, inject } from '@angular/core';
import { docData, useDocRef } from 'ng-firebase-signals';

@Component({
  selector: 'app-lazy-profile',
  template: `
    <div *ngIf="shouldLoadProfile()">
      <app-user-profile [userId]="userId()"></app-user-profile>
    </div>
    
    <button *ngIf="!shouldLoadProfile()" (click)="loadProfile()">
      Load Profile
    </button>
  `
})
export class LazyProfileComponent {
  private shouldLoad = signal(false);
  userId = signal('123');
  
  shouldLoadProfile() {
    return this.shouldLoad();
  }
  
  loadProfile() {
    this.shouldLoad.set(true);
  }
}
```

### Debounced Search

```typescript
import { Component, inject } from '@angular/core';
import { collectionData, useCollectionRef, createQuery, whereField } from 'ng-firebase-signals';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-search',
  template: `
    <input #searchInput placeholder="Search users..." (input)="onSearch(searchInput.value)">
    
    <div *ngFor="let user of searchResults.data()" class="user-item">
      {{ user.displayName }}
    </div>
  `
})
export class SearchComponent {
  private searchQuery = signal('');
  searchResults = collectionData(useCollectionRef('users'));
  
  onSearch(query: string) {
    this.searchQuery.set(query);
    
    if (query.trim()) {
      this.searchResults = collectionData(
        createQuery(
          useCollectionRef('users'),
          whereField('displayName', '>=', query),
          whereField('displayName', '<=', query + '\uf8ff')
        )
      );
    }
  }
}
```

## Testing Examples

### Unit Testing

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideFirebase } from 'ng-firebase-signals';
import { UserProfileComponent } from './user-profile.component';

describe('UserProfileComponent', () => {
  let component: UserProfileComponent;
  let fixture: ComponentFixture<UserProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideFirebase({
          apiKey: 'test-key',
          authDomain: 'test.firebaseapp.com',
          projectId: 'test-project',
          storageBucket: 'test.appspot.com',
          messagingSenderId: '123',
          appId: 'test-app'
        })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should show loading state initially', () => {
    expect(component.userProfile.status()).toBe('loading');
  });

  it('should display user profile when data loads', () => {
    // Mock Firestore response
    // Test implementation here
  });
});
```

### Integration Testing

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideFirebase } from 'ng-firebase-signals';
import { FileUploadComponent } from './file-upload.component';

describe('FileUploadComponent Integration', () => {
  let component: FileUploadComponent;
  let fixture: ComponentFixture<FileUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideFirebase({
          apiKey: 'test-key',
          authDomain: 'test.firebaseapp.com',
          projectId: 'test-project',
          storageBucket: 'test.appspot.com',
          messagingSenderId: '123',
          appId: 'test-app'
        })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FileUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should handle file selection and upload', async () => {
    // Create mock file
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    
    // Simulate file selection
    const event = { target: { files: [file] } };
    component.onFileSelected(event);
    
    // Verify upload was initiated
    expect(component.fileUpload.status()).toBe('loading');
  });
});
```

## Common Use Cases

### User Authentication Flow

```typescript
import { Component, inject } from '@angular/core';
import { createUserState, signInWithGoogle, signOut } from 'ng-firebase-signals';

@Component({
  selector: 'app-auth-flow',
  template: `
    <div *ngIf="!authState.user(); else authenticated">
      <button (click)="signIn()">Sign In with Google</button>
    </div>
    
    <ng-template #authenticated>
      <div>
        <h2>Welcome, {{ authState.user()?.displayName }}</h2>
        <button (click)="logout()">Sign Out</button>
      </div>
    </ng-template>
  `
})
export class AuthFlowComponent {
  authState = createUserState();
  signInAction = signInWithGoogle();
  signOutAction = signOut();
  
  async signIn() {
    await this.signInAction.signIn();
  }
  
  async logout() {
    await this.signOutAction.logout();
  }
}
```

### File Management System

```typescript
import { Component } from '@angular/core';
import { uploadFile, listFiles, deleteFile } from 'ng-firebase-signals';

@Component({
  selector: 'app-file-manager',
  template: `
    <div class="file-manager">
      <input type="file" (change)="onFileSelected($event)">
      
      <div class="file-list">
        <div *ngFor="let file of files.data()?.files" class="file-item">
          <span>{{ file.name }}</span>
          <span>{{ file.size | fileSize }}</span>
          <button (click)="deleteFile(file.fullPath)">Delete</button>
        </div>
      </div>
      
      <div *ngIf="currentUpload.progress()" class="upload-progress">
        {{ currentUpload.progress()?.percentage }}%
      </div>
    </div>
  `
})
export class FileManagerComponent {
  files = listFiles('uploads/');
  currentUpload = uploadFile('uploads/', null);
  currentDeletion = deleteFile('');
  
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.currentUpload = uploadFile(`uploads/${file.name}`, file);
      this.currentUpload.startUpload();
    }
  }
  
  deleteFile(path: string) {
    this.currentDeletion = deleteFile(path);
    this.currentDeletion.deleteFile().then(() => {
      this.files.list(); // Refresh list
    });
  }
}
```

These examples demonstrate the core patterns and best practices for using ng-firebase-signals in real applications.
