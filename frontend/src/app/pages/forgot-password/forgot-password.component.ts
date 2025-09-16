import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoaderService } from '../../services/loader.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="forgot-container">
      <div class="forgot-card">
        <div class="forgot-header">
          <h1><i class="pi pi-envelope"></i> Forgot Password</h1>
          <p>Enter your email address and we'll send you a link to reset your password</p>
        </div>

        <form (ngSubmit)="onSubmit()" class="forgot-form" *ngIf="!isSuccess">
          <div class="form-group">
            <label for="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              [(ngModel)]="email" 
              name="email"
              placeholder="Enter your email address"
              required
            >
          </div>

          <div class="error" *ngIf="error">{{ error }}</div>

          <button 
            type="submit" 
            class="btn btn-primary forgot-btn" 
            [disabled]="isLoading"
          >
            <span *ngIf="isLoading">Sending...</span>
            <span *ngIf="!isLoading">Send Reset Link</span>
          </button>
        </form>

        <div class="success-message" *ngIf="isSuccess">
          <div class="success-icon">
            <i class="pi pi-check-circle"></i>
          </div>
          <h3>Reset Link Sent!</h3>
          <p>We've sent a password reset link to <strong>{{ email }}</strong></p>
          <p class="small-text">Please check your email and click the link to reset your password.</p>
        </div>

        <div class="back-to-login">
          <a routerLink="/login" class="back-link">
            <i class="pi pi-arrow-left"></i> Back to Login
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .forgot-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #4099ff 0%, #7759de 100%);
      padding: 1rem;
    }

    .forgot-card {
      background: var(--surface);
      border-radius: 12px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      padding: 3rem 2.5rem;
      width: 100%;
      max-width: 420px;
    }

    .forgot-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .forgot-header h1 {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .forgot-header p {
      color: var(--text-light);
      font-size: 0.875rem;
      line-height: 1.5;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      font-weight: 500;
      margin-bottom: 0.5rem;
      color: var(--text);
      font-size: 14px;
    }

    .form-group input {
      width: 100%;
      padding: 1rem;
      border: 2px solid var(--border);
      border-radius: 8px;
      background: var(--background);
      color: var(--text);
      font-size: 14px;
      transition: all 0.3s ease;
    }

    .form-group input:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(64, 153, 255, 0.15);
    }

    .error {
      background: var(--error-bg);
      color: var(--error-text);
      padding: 0.75rem;
      border-radius: 8px;
      font-size: 0.875rem;
      margin-bottom: 1rem;
      text-align: center;
    }

    .forgot-btn {
      width: 100%;
      padding: 1rem;
      font-weight: 600;
      font-size: 15px;
      border-radius: 8px;
      background: var(--primary);
      border: none;
      color: white;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .forgot-btn:hover {
      background: #2563eb;
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(64, 153, 255, 0.3);
    }

    .forgot-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .success-message {
      text-align: center;
    }

    .success-icon {
      font-size: 4rem;
      color: var(--success);
      margin-bottom: 1rem;
    }

    .success-message h3 {
      color: var(--text);
      margin-bottom: 1rem;
    }

    .success-message p {
      color: var(--text-light);
      margin-bottom: 1rem;
    }

    .small-text {
      font-size: 0.8rem;
      color: var(--text-light);
    }

    .back-to-login {
      text-align: center;
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border);
    }

    .back-link {
      color: var(--primary);
      text-decoration: none;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: color 0.2s ease;
    }

    .back-link:hover {
      color: #2563eb;
    }
  `]
})
export class ForgotPasswordComponent {
  email = '';
  error = '';
  isLoading = false;
  isSuccess = false;

  constructor(
    private authService: AuthService,
    private loaderService: LoaderService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.error = '';

    if (!this.email) {
      this.error = 'Please enter your email address';
      return;
    }

    if (!this.isValidEmail(this.email)) {
      this.error = 'Please enter a valid email address';
      return;
    }

    this.isLoading = true;
    this.loaderService.show('Sending reset link...');

    this.authService.forgotPassword(this.email).subscribe({
      next: () => {
        this.isSuccess = true;
        this.loaderService.hide();
      },
      error: (error) => {
        this.error = error.error?.message || 'Failed to send reset link. Please try again.';
        this.isLoading = false;
        this.loaderService.hide();
      }
    });
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}