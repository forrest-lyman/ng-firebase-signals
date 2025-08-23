# Firestore

The Firestore module provides reactive data binding, real-time synchronization, and query building using Angular signals.

## Overview

Each Firestore function is focused and does one specific thing, returning reactive signals for data management. This approach provides clean separation of concerns and better composability.

## Core Functions

### Document Data

#### `docData<T>(ref: DocumentReference<T>, options?: FirestoreOptions<T>)`

Creates a reactive document data signal that automatically updates when the document changes.

```typescript
import { docData, useDocRef } from 'ng-firebase-signals';

@Component({...})
export class UserProfileComponent {
  userProfile = docData(useDocRef('users/123'));
  
  // Access reactive data
  user = this.userProfile.data;
  status = this.userProfile.status;
  error = this.userProfile.error;
  metadata = this.userProfile.metadata;
}
```

**Parameters:**
- `ref` - Document reference to watch
- `options` - Optional configuration including transform function

**Returns:**
- `data` - Signal containing the document data or null
- `status` - Signal with current operation status
- `error` - Signal containing any errors
- `metadata` - Signal with document metadata (cache status, pending writes)

**Template Usage:**
```html
<div *ngIf="userProfile.data()">
  <h2>{{ userProfile.data()?.name }}</h2>
  <p>{{ userProfile.data()?.email }}</p>
</div>

<div *ngIf="userProfile.status() === 'loading'">
  Loading profile...
</div>

<div *ngIf="userProfile.error()">
  Error: {{ userProfile.error() }}
</div>

<div *ngIf="userProfile.metadata()?.fromCache">
  (Data from cache)
</div>
```

### Collection Data

#### `collectionData<T>(ref: CollectionReference<T> | Query<T>, options?: FirestoreOptions<T>)`

Creates a reactive collection data signal that automatically updates when the collection changes.

```typescript
import { collectionData, useCollectionRef } from 'ng-firebase-signals';

@Component({...})
export class UsersListComponent {
  users = collectionData(useCollectionRef('users'));
  
  // Access reactive data
  usersList = this.users.data;
  status = this.users.status;
  error = this.users.error;
  metadata = this.users.metadata;
}
```

**Parameters:**
- `ref` - Collection reference or query to watch
- `options` - Optional configuration including transform function

**Returns:**
- `data` - Signal containing the collection data array
- `status` - Signal with current operation status
- `error` - Signal containing any errors
- `metadata` - Signal with collection metadata (cache status, pending writes)

**Template Usage:**
```html
<div *ngFor="let user of users.data()">
  <h3>{{ user.name }}</h3>
  <p>{{ user.email }}</p>
</div>

<div *ngIf="users.status() === 'loading'">
  Loading users...
</div>

<div *ngIf="users.error()">
  Error: {{ users.error() }}
</div>
```

## Query Building

### Basic Query Functions

#### `createQuery<T>(collectionRef: CollectionReference<T>, ...constraints: QueryConstraint[])`

Creates a query with the specified constraints.

```typescript
import { createQuery, useCollectionRef } from 'ng-firebase-signals';

@Component({...})
export class FilteredUsersComponent {
  private usersRef = useCollectionRef('users');
  
  // Create a query for active users, ordered by name
  activeUsers = collectionData(
    createQuery(
      this.usersRef,
      whereField('status', '==', 'active'),
      orderByField('name', 'asc')
    )
  );
}
```

#### `whereField(field: string, op: '==' | '!=' | '<' | '<=', value: any)`

Creates a where constraint for filtering documents.

```typescript
import { whereField } from 'ng-firebase-signals';

// Filter users by age
const ageFilter = whereField('age', '>=', 18);

// Filter users by status
const statusFilter = whereField('status', '==', 'active');

// Filter users by email domain
const emailFilter = whereField('email', '!=', 'admin@example.com');
```

#### `orderByField(field: string, direction: 'asc' | 'desc' = 'asc')`

Creates an order by constraint for sorting documents.

```typescript
import { orderByField } from 'ng-firebase-signals';

// Sort by name ascending
const nameSort = orderByField('name');

// Sort by creation date descending
const dateSort = orderByField('createdAt', 'desc');

// Sort by multiple fields
const multiSort = [
  orderByField('status'),
  orderByField('createdAt', 'desc')
];
```

#### `limitResults(count: number)`

Creates a limit constraint for pagination.

```typescript
import { limitResults } from 'ng-firebase-signals';

// Limit to 10 results
const limit10 = limitResults(10);

// Limit to 50 results
const limit50 = limitResults(50);
```

#### `startAfterDoc(doc: DocumentSnapshot)`

Creates a start after constraint for pagination.

```typescript
import { startAfterDoc } from 'ng-firebase-signals';

@Component({...})
export class PaginatedUsersComponent {
  private usersRef = useCollectionRef('users');
  
  // Get first page
  firstPage = collectionData(
    createQuery(
      this.usersRef,
      orderByField('name'),
      limitResults(10)
    )
  );
  
  // Get next page
  nextPage(lastDoc: DocumentSnapshot) {
    return collectionData(
      createQuery(
        this.usersRef,
        orderByField('name'),
        startAfterDoc(lastDoc),
        limitResults(10)
      )
    );
  }
}
```

#### `endBeforeDoc(doc: DocumentSnapshot)`

Creates an end before constraint for pagination.

```typescript
import { endBeforeDoc } from 'ng-firebase-signals';

@Component({...})
export class PaginatedUsersComponent {
  // Get previous page
  previousPage(firstDoc: DocumentSnapshot) {
    return collectionData(
      createQuery(
        this.usersRef,
        orderByField('name'),
        endBeforeDoc(firstDoc),
        limitResults(10)
      )
    );
  }
}
```

## Utility Functions

### Reference Helpers

#### `useDocRef<T>(path: string)`

Creates a document reference for the specified path.

```typescript
import { useDocRef } from 'ng-firebase-signals';

@Component({...})
export class DocumentComponent {
  // Create document references
  userRef = useDocRef('users/123');
  postRef = useDocRef('posts/456');
  commentRef = useDocRef('comments/789');
}
```

#### `useCollectionRef<T>(path: string)`

Creates a collection reference for the specified path.

```typescript
import { useCollectionRef } from 'ng-firebase-signals';

@Component({...})
export class CollectionComponent {
  // Create collection references
  usersRef = useCollectionRef('users');
  postsRef = useCollectionRef('posts');
  commentsRef = useCollectionRef('comments');
}
```

#### `useQuery<T>(collectionRef: CollectionReference<T>, ...constraints: QueryConstraint[])`

Creates a query with the specified constraints (alias for `createQuery`).

```typescript
import { useQuery, useCollectionRef } from 'ng-firebase-signals';

@Component({...})
export class QueryComponent {
  private usersRef = useCollectionRef('users');
  
  // Create queries
  activeUsers = useQuery(
    this.usersRef,
    whereField('status', '==', 'active')
  );
  
  recentUsers = useQuery(
    this.usersRef,
    orderByField('createdAt', 'desc'),
    limitResults(5)
  );
}
```

## Advanced Usage

### Complex Queries

```typescript
import { 
  collectionData, 
  useCollectionRef, 
  createQuery,
  whereField,
  orderByField,
  limitResults 
} from 'ng-firebase-signals';

@Component({...})
export class AdvancedQueryComponent {
  private postsRef = useCollectionRef('posts');
  
  // Complex query: published posts by category, ordered by date, limited to 20
  publishedPosts = collectionData(
    createQuery(
      this.postsRef,
      whereField('status', '==', 'published'),
      whereField('category', '==', 'technology'),
      orderByField('publishedAt', 'desc'),
      limitResults(20)
    )
  );
  
  // Multiple where conditions
  featuredPosts = collectionData(
    createQuery(
      this.postsRef,
      whereField('status', '==', 'published'),
      whereField('featured', '==', true),
      orderByField('publishedAt', 'desc')
    )
  );
}
```

### Data Transformation

```typescript
import { docData, useDocRef } from 'ng-firebase-signals';

@Component({...})
export class TransformedDataComponent {
  // Transform document data
  userProfile = docData(
    useDocRef('users/123'),
    {
      transform: (doc) => ({
        id: doc.id,
        ...doc.data(),
        fullName: `${doc.data().firstName} ${doc.data().lastName}`,
        isAdult: doc.data().age >= 18
      })
    }
  );
  
  // Transform collection data
  users = collectionData(
    useCollectionRef('users'),
    {
      transform: (doc) => ({
        id: doc.id,
        ...doc.data(),
        displayName: doc.data().displayName || 'Anonymous User',
        lastSeen: doc.data().lastSeen?.toDate() || new Date()
      })
    }
  );
}
```

### Real-time Updates with Metadata

```typescript
import { docData, useDocRef } from 'ng-firebase-signals';

@Component({...})
export class RealTimeComponent {
  userProfile = docData(useDocRef('users/123'));
  
  // Access metadata for UI feedback
  get isFromCache() {
    return this.userProfile.metadata()?.fromCache || false;
  }
  
  get hasPendingWrites() {
    return this.userProfile.metadata()?.hasPendingWrites || false;
  }
}
```

**Template Usage:**
```html
<div class="user-profile">
  <div *ngIf="userProfile.data()">
    <h2>{{ userProfile.data()?.displayName }}</h2>
    
    <!-- Show cache status -->
    <div *ngIf="isFromCache" class="cache-indicator">
      (Data from cache)
    </div>
    
    <!-- Show pending writes -->
    <div *ngIf="hasPendingWrites" class="pending-indicator">
      Saving changes...
    </div>
  </div>
</div>
```

## Complete Example

```typescript
import { Component, inject } from '@angular/core';
import { 
  docData, 
  collectionData,
  useDocRef, 
  useCollectionRef,
  createQuery,
  whereField,
  orderByField,
  limitResults 
} from 'ng-firebase-signals';

@Component({
  selector: 'app-users',
  template: `
    <div class="users-container">
      <!-- User Profile -->
      <div *ngIf="userProfile.data()" class="profile-section">
        <h2>{{ userProfile.data()?.displayName }}</h2>
        <p>{{ userProfile.data()?.email }}</p>
        <p>Member since: {{ userProfile.data()?.createdAt | date }}</p>
      </div>
      
      <!-- Users List -->
      <div class="users-list">
        <h3>All Users ({{ users.data().length }})</h3>
        
        <div *ngFor="let user of users.data()" class="user-item">
          <h4>{{ user.displayName }}</h4>
          <p>{{ user.email }}</p>
          <span class="status {{ user.status }}">
            {{ user.status }}
          </span>
        </div>
        
        <div *ngIf="users.status() === 'loading'" class="loading">
          Loading users...
        </div>
        
        <div *ngIf="users.error()" class="error">
          Error: {{ users.error() }}
        </div>
      </div>
      
      <!-- Active Users -->
      <div class="active-users">
        <h3>Active Users ({{ activeUsers.data().length }})</h3>
        
        <div *ngFor="let user of activeUsers.data()" class="user-item">
          <h4>{{ user.displayName }}</h4>
          <p>Last active: {{ user.lastActive | date:'short' }}</p>
        </div>
      </div>
    </div>
  `
})
export class UsersComponent {
  // Document data
  userProfile = docData(useDocRef('users/123'));
  
  // Collection data
  users = collectionData(useCollectionRef('users'));
  
  // Filtered collection data
  activeUsers = collectionData(
    createQuery(
      useCollectionRef('users'),
      whereField('status', '==', 'active'),
      orderByField('lastActive', 'desc'),
      limitResults(10)
    )
  );
}
```

## Best Practices

1. **Compose Functions**: Mix and match Firestore functions as needed
2. **Handle Loading States**: Always check status signals in your templates
3. **Error Handling**: Display error signals for better user experience
4. **Metadata Usage**: Use metadata signals to show cache status and pending writes
5. **Query Optimization**: Use appropriate indexes for complex queries
6. **Data Transformation**: Use transform functions to format data for your UI
7. **Cleanup**: Functions automatically clean up subscriptions when components are destroyed

## Performance Considerations

- **Indexes**: Ensure you have proper indexes for your queries
- **Limits**: Use `limitResults()` for pagination to avoid loading too much data
- **Real-time Updates**: Only subscribe to documents/collections you need
- **Caching**: Firestore automatically caches data for offline support
- **Batch Operations**: Use Firestore batch operations for multiple writes

## Error Handling

All Firestore functions provide error signals that you can use to display user-friendly error messages:

```typescript
// Check for errors
if (userProfile.error()) {
  console.error('Failed to load user profile:', userProfile.error());
}

// Display in template
<div *ngIf="userProfile.error()" class="error-message">
  {{ userProfile.error() }}
</div>
```

## Security Rules

Remember to set up proper Firestore security rules:

```javascript
// Example security rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Posts can be read by anyone, written by authenticated users
    match /posts/{postId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```
