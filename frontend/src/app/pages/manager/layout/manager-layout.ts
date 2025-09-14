import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService, User } from '../../../services/auth.service';
import { ThemeToggle } from '../../../components/theme-toggle';

@Component({
  selector: 'app-manager-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ThemeToggle],
  template: `
    <div class="layout">
      <nav class="sidebar">
        <div class="sidebar-header">
          <div class="header-top">
            <h2><i class="pi pi-building"></i> Meeting Rooms</h2>
            <app-theme-toggle></app-theme-toggle>
          </div>
          <div class="user-info">
            <div class="user-avatar">{{ getUserInitials() }}</div>
            <div class="user-details">
              <div class="user-name">{{ currentUser?.userName }}</div>
              <div class="user-role">{{ currentUser?.roles?.[0] || 'User' }}</div>
            </div>
          </div>
        </div>
        
        <div class="nav-menu">
          <a routerLink="home" routerLinkActive="active" class="nav-item">
            <i class="pi pi-home nav-icon"></i>
            <span>Home</span>
          </a>
          <a routerLink="approvals" routerLinkActive="active" class="nav-item highlight">
            <i class="pi pi-check-circle nav-icon"></i>
            <span>Approvals</span>
          </a>
          <a routerLink="team" routerLinkActive="active" class="nav-item">
            <i class="pi pi-users nav-icon"></i>
            <span>Team</span>
          </a>
          <a routerLink="book-meeting" routerLinkActive="active" class="nav-item">
            <i class="pi pi-calendar-plus nav-icon"></i>
            <span>Book Meeting</span>
          </a>
          <a routerLink="calendar" routerLinkActive="active" class="nav-item">
            <i class="pi pi-calendar nav-icon"></i>
            <span>Calendar</span>
          </a>
          <a routerLink="my-bookings" routerLinkActive="active" class="nav-item">
            <i class="pi pi-list nav-icon"></i>
            <span>My Bookings</span>
          </a>
          <a routerLink="invitations" routerLinkActive="active" class="nav-item">
            <i class="pi pi-envelope nav-icon"></i>
            <span>Invitations</span>
          </a>
          <a routerLink="profile" routerLinkActive="active" class="nav-item">
            <i class="pi pi-user nav-icon"></i>
            <span>Profile</span>
          </a>
        </div>
        
        <div class="sidebar-footer">
          <button class="logout-btn" (click)="logout()">
            <i class="pi pi-sign-out nav-icon"></i>
            <span>Logout</span>
          </button>
        </div>
      </nav>
      
      <main class="main-content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .layout {
      display: flex;
      min-height: 100vh;
    }

    .sidebar {
      width: 280px;
      background: var(--surface);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh;
      overflow-y: auto;
    }

    .sidebar-header {
      padding: 1.5rem;
      border-bottom: 1px solid var(--border);
    }

    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .sidebar-header h2 {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text);
      margin: 0;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      background: var(--secondary);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.875rem;
    }

    .user-details {
      flex: 1;
    }

    .user-name {
      font-weight: 600;
      color: var(--text);
      font-size: 0.875rem;
    }

    .user-role {
      font-size: 0.75rem;
      color: var(--text-light);
    }

    .nav-menu {
      flex: 1;
      padding: 1rem 0;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1.5rem;
      color: var(--text-light);
      text-decoration: none;
      transition: all 0.2s ease;
      border-left: 3px solid transparent;
    }

    .nav-item:hover {
      background: var(--background);
      color: var(--text);
    }

    .nav-item.active {
      background: var(--background);
      color: var(--secondary);
      border-left-color: var(--secondary);
    }

    .nav-item.highlight {
      background: rgba(16, 185, 129, 0.1);
      color: var(--secondary);
    }

    .nav-item.highlight.active {
      border-left-color: var(--secondary);
    }

    .nav-icon {
      font-size: 1.125rem;
      width: 1.125rem;
      text-align: center;
    }

    .sidebar-footer {
      padding: 1rem;
      border-top: 1px solid var(--border);
    }

    .logout-btn {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      width: 100%;
      padding: 0.75rem;
      background: none;
      border: none;
      color: var(--text-light);
      cursor: pointer;
      border-radius: 8px;
      transition: all 0.2s ease;
    }

    .logout-btn:hover {
      background: var(--background);
      color: var(--error);
    }

    .main-content {
      flex: 1;
      background: var(--background);
      overflow-y: auto;
      margin-left: 280px;
    }

    @media (max-width: 768px) {
      .sidebar {
        width: 100%;
        position: fixed;
        top: 0;
        left: 0;
        z-index: 1000;
        transform: translateX(-100%);
        transition: transform 0.3s ease;
      }

      .main-content {
        margin-left: 0;
      }
    }
  `]
})
export class ManagerLayout {
  currentUser: User | null = null;

  constructor(private authService: AuthService) {
    this.currentUser = this.authService.getCurrentUser();
  }

  getUserInitials(): string {
    if (!this.currentUser?.userName) return 'M';
    return this.currentUser.userName.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  logout(): void {
    this.authService.logout();
  }
}