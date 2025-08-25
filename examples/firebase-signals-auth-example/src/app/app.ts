import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  initializeAuth, 
  signInWithGoogle, 
  signInWithEmail, 
  createUser, 
  signOut, 
  userState 
} from 'ng-firebase-signals';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('Firebase Signals Auth Example');
  protected readonly userState = userState;
  
  // Form signals
  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly displayName = signal('');
  protected readonly isSignUp = signal(false);
  
  constructor() {
    // Constructor is empty - initialization moved to ngOnInit
  }
  
  ngOnInit() {
    // Initialize auth state listener
    initializeAuth();
  }
  
  async loginWithGoogle() {
    try {
      await signInWithGoogle();
      console.log('Successfully signed in with Google!');
    } catch (error) {
      console.error('Google sign in failed:', error);
    }
  }
  
  async loginWithEmail() {
    try {
      if (this.isSignUp()) {
        await createUser(this.email(), this.password(), this.displayName());
        console.log('Account created successfully!');
      } else {
        await signInWithEmail(this.email(), this.password());
        console.log('Successfully signed in!');
      }
      // Clear form
      this.email.set('');
      this.password.set('');
      this.displayName.set('');
    } catch (error) {
      console.error('Authentication failed:', error);
    }
  }
  
  async logout() {
    try {
      await signOut();
      console.log('Successfully signed out!');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  }
  
  toggleSignUp() {
    this.isSignUp.set(!this.isSignUp());
  }
}
