import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService, User } from '../../../services/auth.service';
import { ThemeToggle } from '../../../components/theme-toggle';
import { ToastComponent } from '../../../components/toast/toast.component';

@Component({
  selector: 'app-employee-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ThemeToggle, ToastComponent],
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
          <a routerLink="book-room" routerLinkActive="active" class="nav-item">
            <i class="pi pi-calendar-plus nav-icon"></i>
            <span>Request Meeting</span>
          </a>
          <a routerLink="my-bookings" routerLinkActive="active" class="nav-item">
            <i class="pi pi-list nav-icon"></i>
            <span>My Bookings</span>
          </a>
          <a routerLink="my-requests" routerLinkActive="active" class="nav-item">
            <i class="pi pi-inbox nav-icon"></i>
            <span>My Requests</span>
          </a>
          <a routerLink="calendar" routerLinkActive="active" class="nav-item">
            <i class="pi pi-calendar nav-icon"></i>
            <span>Calendar</span>
          </a>
          <a routerLink="invitations" routerLinkActive="active" class="nav-item">
            <i class="pi pi-envelope nav-icon"></i>
            <span>Invitations</span>
          </a>
          <a routerLink="scheduled-meetings" routerLinkActive="active" class="nav-item">
            <i class="pi pi-calendar-check nav-icon"></i>
            <span>Scheduled Meetings</span>
          </a>
          <a routerLink="profile" routerLinkActive="active" class="nav-item">
            <i class="pi pi-user nav-icon"></i>
            <span>Profile</span>
          </a>
        </div>
        
        <div class="sidebar-footer">
          <div class="role-badge employee">
            <i class="pi pi-user"></i>
            <span>Employee</span>
          </div>
          <button class="logout-btn" (click)="logout()">
            <i class="pi pi-sign-out nav-icon"></i>
            <span>Logout</span>
          </button>
        </div>
      </nav>
      
      <main class="main-content">
        <router-outlet />
        <app-toast></app-toast>
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
      scrollbar-width: none;
      -ms-overflow-style: none;
      box-shadow: 0 0 25px rgba(0, 0, 0, 0.1);
    }

    .sidebar::-webkit-scrollbar {
      display: none;
    }

    [data-theme="dark"] .sidebar {
      background: linear-gradient(135deg, #3b4650 0%, #2f3349 100%);
      border-right: none;
    }

    .sidebar-header {
      padding: 1.5rem;
      border-bottom: 1px solid var(--border);
      background: var(--background);
    }

    [data-theme="dark"] .sidebar-header {
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(0, 0, 0, 0.1);
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

    [data-theme="dark"] .sidebar-header h2 {
      color: #ffffff;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, var(--primary), var(--info));
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.875rem;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    .user-details {
      flex: 1;
    }

    .user-name {
      font-weight: 600;
      color: var(--text);
      font-size: 0.875rem;
    }

    [data-theme="dark"] .user-name {
      color: #ffffff;
    }

    .user-role {
      font-size: 0.75rem;
      color: var(--text-light);
    }

    [data-theme="dark"] .user-role {
      color: #b9c7d4;
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
      transition: all 0.3s ease;
      border-left: 3px solid transparent;
      position: relative;
      margin: 2px 0;
    }

    [data-theme="dark"] .nav-item {
      color: #b9c7d4;
    }

    .nav-item:hover {
      background: var(--background);
      color: var(--text);
      border-left-color: var(--primary);
    }

    [data-theme="dark"] .nav-item:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
    }

    .nav-item.active {
      background: rgba(64, 153, 255, 0.15);
      color: var(--primary);
      border-left-color: var(--primary);
      box-shadow: inset 0 0 10px rgba(64, 153, 255, 0.1);
    }

    .nav-icon {
      font-size: 1.125rem;
      width: 1.125rem;
      text-align: center;
    }

    .sidebar-footer {
      padding: 1rem;
      border-top: 1px solid var(--border);
      background: var(--background);
    }

    [data-theme="dark"] .sidebar-footer {
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(0, 0, 0, 0.1);
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
      border-radius: var(--border-radius);
      transition: all 0.3s ease;
    }

    [data-theme="dark"] .logout-btn {
      color: #b9c7d4;
    }

    .logout-btn:hover {
      background: rgba(255, 83, 112, 0.15);
      color: var(--error);
      transform: translateX(5px);
    }

    .main-content {
      flex: 1;
      background: var(--background);
      overflow-y: auto;
      margin-left: 280px;
    }

    .role-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.5rem;
      margin-bottom: 0.5rem;
      background: linear-gradient(135deg, var(--primary), #4099ff);
      color: white;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
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
export class EmployeeLayout {
  currentUser: User | null = null;

  constructor(private authService: AuthService) {
    this.currentUser = this.authService.getCurrentUser();
  }

  getUserInitials(): string {
    if (!this.currentUser?.userName) return 'U';
    return this.currentUser.userName.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  logout(): void {
    this.authService.logout();
  }
}