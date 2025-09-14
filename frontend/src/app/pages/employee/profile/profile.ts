import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <div class="page-header">
        <h1><i class="pi pi-user"></i> Profile</h1>
        <p>Manage your account information</p>
      </div>

      <div class="profile-container">
        <div class="profile-card">
          <div class="profile-avatar">
            {{ getUserInitials() }}
          </div>
          
          <div class="profile-info">
            <h2>{{ currentUser?.userName }}</h2>
            <p class="role">{{ currentUser?.roles?.[0] || 'User' }}</p>
            
            <div class="info-grid">
              <div class="info-item">
                <label>Email</label>
                <span>{{ currentUser?.email }}</span>
              </div>
              
              <div class="info-item">
                <label>Department</label>
                <span>{{ currentUser?.department }}</span>
              </div>
              
              <div class="info-item" *ngIf="currentUser?.managerName">
                <label>Manager</label>
                <span>{{ currentUser?.managerName }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }

    .page-header h1 {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 0.5rem;
    }

    .page-header p {
      color: var(--text-light);
      margin-bottom: 2rem;
    }

    .profile-card {
      background: var(--surface);
      border-radius: 12px;
      padding: 2rem;
      box-shadow: var(--shadow);
      border: 1px solid var(--border);
      text-align: center;
    }

    .profile-avatar {
      width: 100px;
      height: 100px;
      background: var(--primary);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      font-weight: 700;
      margin: 0 auto 1.5rem;
    }

    .profile-info h2 {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 0.5rem;
    }

    .role {
      color: var(--primary);
      font-weight: 500;
      margin-bottom: 2rem;
    }

    .info-grid {
      display: grid;
      gap: 1.5rem;
      text-align: left;
      max-width: 400px;
      margin: 0 auto;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .info-item label {
      font-weight: 600;
      color: var(--text-light);
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .info-item span {
      color: var(--text);
      font-size: 1rem;
    }
  `]
})
export class Profile implements OnInit {
  currentUser: User | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }

  getUserInitials(): string {
    if (!this.currentUser?.userName) return 'U';
    return this.currentUser.userName.split(' ').map(n => n[0]).join('').toUpperCase();
  }
}