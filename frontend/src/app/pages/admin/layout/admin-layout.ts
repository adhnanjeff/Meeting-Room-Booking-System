import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService, User } from '../../../services/auth.service';
import { ThemeToggle } from '../../../components/theme-toggle';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ThemeToggle],
  template: `
    <div class="layout">
      <div class="mobile-header">
        <button class="burger-menu" (click)="toggleSidebar()">
          <i class="pi pi-bars"></i>
        </button>
        <h2>SynerRoom</h2>
        <app-theme-toggle></app-theme-toggle>
      </div>
      
      <nav class="sidebar" [class.open]="sidebarOpen">
        <div class="sidebar-header">
          <div class="header-top">
            <h2>SynerRoom</h2>
            <app-theme-toggle></app-theme-toggle>
          </div>
          <div class="user-info">
            <div class="user-avatar admin">{{ getUserInitials() }}</div>
            <div class="user-details">
              <div class="user-name">{{ currentUser?.userName }}</div>
              <div class="user-role">{{ currentUser?.roles?.[0] || 'User' }}</div>
            </div>
          </div>
        </div>
        
        <div class="nav-menu">
          <a routerLink="home" routerLinkActive="active" class="nav-item">
            <i class="pi pi-chart-line nav-icon"></i>
            <span>Dashboard</span>
          </a>
          <a routerLink="users" routerLinkActive="active" class="nav-item">
            <i class="pi pi-users nav-icon"></i>
            <span>User Management</span>
          </a>
          <a routerLink="rooms" routerLinkActive="active" class="nav-item">
            <i class="pi pi-building nav-icon"></i>
            <span>Room Management</span>
          </a>
          <a routerLink="bookings" routerLinkActive="active" class="nav-item">
            <i class="pi pi-calendar nav-icon"></i>
            <span>All Bookings</span>
          </a>
        </div>
        
        <div class="sidebar-footer">
          <div class="role-badge admin">
            <i class="pi pi-shield"></i>
            <span>Admin</span>
          </div>
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
      scrollbar-width: none;
      -ms-overflow-style: none;
    }

    .sidebar::-webkit-scrollbar {
      display: none;
    }

    .sidebar-header {
      padding: 1.5rem;
      border-bottom: 1px solid var(--border);
    }

    .sidebar-header h2 {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 1rem;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      background: var(--primary);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.875rem;
    }

    .user-avatar.admin {
      background: var(--error);
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
      color: var(--error);
      border-left-color: var(--error);
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

    .mobile-header {
      display: none;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1001;
    }

    .burger-menu {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: var(--text);
      cursor: pointer;
    }

    .main-content {
      flex: 1;
      background: var(--background);
      overflow-y: auto;
      margin-left: 280px;
    }

    @media (max-width: 768px) {
      .mobile-header {
        display: flex;
      }

      .sidebar {
        transform: translateX(-100%);
        transition: transform 0.3s ease;
        z-index: 1000;
      }

      .sidebar.open {
        transform: translateX(0);
      }

      .main-content {
        margin-left: 0;
        padding-top: 70px;
      }

      .sidebar-header .header-top {
        display: none;
      }
    }

    .role-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.5rem;
      margin-bottom: 0.5rem;
      background: linear-gradient(135deg, #ff5370, #ff7043);
      color: white;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
    }
  `]
})
export class AdminLayout {
  currentUser: User | null = null;
  sidebarOpen = false;

  constructor(private authService: AuthService) {
    this.currentUser = this.authService.getCurrentUser();
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  getUserInitials(): string {
    if (!this.currentUser?.userName) return 'A';
    return this.currentUser.userName.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  logout(): void {
    this.authService.logout();
  }
}