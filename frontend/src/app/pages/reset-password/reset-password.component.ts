import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoaderService } from '../../services/loader.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="reset-container">
      <div class="reset-card">
        <div class="reset-header">
          <h1><i class="pi pi-lock"></i> Reset Password</h1>
          <p>Enter your new password below</p>
        </div>

        <form (ngSubmit)="onSubmit()" class="reset-form" *ngIf="!isSuccess">
          <div class="form-group">
            <label for="newPassword">New Password</label>
            <input 
              type="password" 
              id="newPassword" 
              [(ngModel)]="newPassword" 
              name="newPassword"
              placeholder="Enter new password"
              required
              minlength="6"
            >
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input 
              type="password" 
              id="confirmPassword" 
              [(ngModel)]="confirmPassword" 
              name="confirmPassword"
              placeholder="Confirm new password"
              required
            >
          </div>

          <div class="error" *ngIf="error">{{ error }}</div>

          <button 
            type="submit" 
            class="btn btn-primary reset-btn" 
            [disabled]="isLoading"
          >
            <span *ngIf="isLoading">Resetting...</span>
            <span *ngIf="!isLoading">Reset Password</span>
          </button>
        </form>

        <div class="success-message" *ngIf="isSuccess">
          <div class="success-icon">
            <i class="pi pi-check-circle"></i>
          </div>
          <h3>Password Reset Successfully!</h3>
          <p>Your password has been updated. You can now sign in with your new password.</p>
          <button class="btn btn-primary" (click)="goToLogin()">Go to Login</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reset-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #4099ff 0%, #7759de 100%);
      padding: 1rem;
    }

    .reset-card {
      background: var(--surface);
      border-radius: 12px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      padding: 3rem 2.5rem;
      width: 100%;
      max-width: 420px;
    }

    .reset-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .reset-header h1 {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .reset-header p {
      color: var(--text-light);
      font-size: 0.875rem;
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

    .reset-btn {
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

    .reset-btn:hover {
      background: #2563eb;
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(64, 153, 255, 0.3);
    }

    .reset-btn:disabled {
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
      margin-bottom: 2rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-primary {
      background: var(--primary);
      color: white;
    }

    .btn-primary:hover {
      background: #2563eb;
    }
  `]
})
export class ResetPasswordComponent implements OnInit {
  newPassword = '';
  confirmPassword = '';
  error = '';
  isLoading = false;
  isSuccess = false;
  
  private email = '';
  private token = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private loaderService: LoaderService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      this.token = params['token'] || '';
      
      if (!this.email || !this.token) {
        this.error = 'Invalid reset link. Please request a new password reset.';
      }
    });
  }

  onSubmit(): void {
    this.error = '';

    if (!this.newPassword || !this.confirmPassword) {
      this.error = 'Please fill in all fields';
      return;
    }

    if (this.newPassword.length < 6) {
      this.error = 'Password must be at least 6 characters long';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    this.isLoading = true;
    this.loaderService.show('Resetting password...');

    this.authService.resetPassword(this.email, this.token, this.newPassword).subscribe({
      next: () => {
        this.isSuccess = true;
        this.loaderService.hide();
      },
      error: (error) => {
        this.error = error.error?.message || 'Failed to reset password. Please try again.';
        this.isLoading = false;
        this.loaderService.hide();
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}