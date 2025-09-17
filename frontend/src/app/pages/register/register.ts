import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService, RegisterRequest } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="register-container">
      <div class="register-card">
        <div class="register-header">
          <h1><i class="pi pi-user-plus"></i> Create Account</h1>
          <p>Register for Meeting Room Booking System</p>
        </div>

        <form (ngSubmit)="onSubmit()" class="register-form">
          <div class="form-group">
            <label for="userName">Username</label>
            <input 
              type="text" 
              id="userName" 
              [(ngModel)]="registerData.userName" 
              name="userName"
              placeholder="Enter username"
              required
            >
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              [(ngModel)]="registerData.email" 
              name="email"
              placeholder="Enter email"
              required
            >
          </div>

          <div class="form-group">
            <label for="department">Department</label>
            <input 
              type="text" 
              id="department" 
              [(ngModel)]="registerData.department" 
              name="department"
              placeholder="Enter department"
              required
            >
          </div>

          <div class="form-group">
            <label for="role">Role</label>
            <select 
              id="role" 
              [(ngModel)]="registerData.role" 
              name="role"
              required
            >
              <option value="">Select Role</option>
              <option value="Employee">Employee</option>
              <option value="Manager">Manager</option>
            </select>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input 
              type="password" 
              id="password" 
              [(ngModel)]="registerData.password" 
              name="password"
              placeholder="Enter password (min 6 characters)"
              required
              minlength="6"
            >
          </div>

          <div class="error" *ngIf="error">{{ error }}</div>
          <div class="success" *ngIf="success">{{ success }}</div>

          <button 
            type="submit" 
            class="btn btn-primary register-btn" 
            [disabled]="isLoading"
          >
            <span *ngIf="isLoading">Creating Account...</span>
            <span *ngIf="!isLoading">Create Account</span>
          </button>
        </form>

        <div class="login-link">
          <p>Already have an account? <a routerLink="/login">Sign In</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--background);
      padding: 1rem;
    }

    .register-card {
      background: var(--surface);
      border-radius: 12px;
      box-shadow: var(--shadow-lg);
      padding: 2rem;
      width: 100%;
      max-width: 400px;
      border: 1px solid var(--border);
    }

    .register-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .register-header h1 {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 0.5rem;
    }

    .register-header p {
      color: var(--text-light);
      font-size: 0.875rem;
    }

    .register-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group label {
      font-weight: 500;
      color: var(--text);
      font-size: 0.875rem;
    }

    .form-group input,
    .form-group select {
      padding: 0.75rem;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: var(--background);
      color: var(--text);
      font-size: 0.875rem;
      transition: all 0.2s ease;
    }

    .form-group input:focus,
    .form-group select:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }

    .error {
      color: var(--error);
      font-size: 0.875rem;
      text-align: center;
      padding: 0.5rem;
      background: var(--error-bg);
      border-radius: 6px;
    }

    .success {
      color: var(--success);
      font-size: 0.875rem;
      text-align: center;
      padding: 0.5rem;
      background: var(--success-bg);
      border-radius: 6px;
    }

    .register-btn {
      width: 100%;
      padding: 0.875rem;
      font-weight: 600;
      color: white;
    }

    .login-link {
      text-align: center;
      margin-top: 1.5rem;
    }

    .login-link p {
      color: var(--text-light);
      font-size: 0.875rem;
    }

    .login-link a {
      color: var(--primary);
      text-decoration: none;
      font-weight: 500;
    }

    .login-link a:hover {
      text-decoration: underline;
    }
  `]
})
export class Register {
  registerData: RegisterRequest = {
    userName: '',
    email: '',
    department: '',
    role: '',
    password: ''
  };
  
  isLoading = false;
  error = '';
  success = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    if (!this.registerData.userName || !this.registerData.email || 
        !this.registerData.department || !this.registerData.role || 
        !this.registerData.password) {
      this.error = 'Please fill in all fields';
      return;
    }

    if (this.registerData.password.length < 6) {
      this.error = 'Password must be at least 6 characters';
      return;
    }

    this.isLoading = true;
    this.error = '';
    this.success = '';

    this.authService.register(this.registerData).subscribe({
      next: (response) => {
        this.success = 'Account created successfully! Redirecting to login...';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        this.error = error.error?.message || 'Registration failed';
        this.isLoading = false;
      }
    });
  }
}