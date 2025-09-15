import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../services/auth.service';
import { NotificationService, Notification } from '../../services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <div class="page-header-card">
        <div class="page-header">
          <h1><i class="pi pi-bell"></i> Notifications</h1>
          <p>Stay updated with your meeting activities</p>
        </div>
      </div>

      <div class="notifications-container">
        <div *ngIf="isLoading" class="loading">
          <div class="loading-spinner"></div>
          <p>Loading notifications...</p>
        </div>

        <div *ngIf="!isLoading && notifications.length === 0" class="empty-state">
          <div class="empty-icon"><i class="pi pi-bell-slash"></i></div>
          <h3>No notifications</h3>
          <p>You're all caught up! No new notifications.</p>
        </div>

        <div class="notifications-list" *ngIf="!isLoading && notifications.length > 0">
          <div *ngFor="let notification of notifications" 
               class="notification-card" 
               [class.unread]="!notification.isRead"
               (click)="markAsRead(notification)">
            <div class="notification-header">
              <h3>{{ notification.title }}</h3>
              <div class="notification-meta">
                <span class="timestamp">{{ formatTime(notification.timestamp) }}</span>
                <button class="delete-btn" (click)="deleteNotification(notification, $event)">
                  <i class="pi pi-times"></i>
                </button>
              </div>
            </div>
            
            <div class="notification-content">
              <p>{{ notification.message }}</p>
              <div class="from-user">
                <i class="pi pi-user"></i>
                <span>From: {{ notification.fromUser }}</span>
              </div>
            </div>
            
            <div class="notification-indicator" *ngIf="!notification.isRead"></div>
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

    .page-header-card {
      background: var(--surface);
      border-radius: 12px;
      padding: 2rem;
      box-shadow: var(--shadow);
      border: 1px solid var(--border);
      margin-bottom: 2rem;
    }

    .page-header h1 {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 0.5rem;
    }

    .page-header p {
      color: var(--text-light);
      margin: 0;
    }

    .loading {
      text-align: center;
      padding: 4rem;
      color: var(--text-light);
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid var(--border);
      border-top: 4px solid var(--primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .empty-state {
      text-align: center;
      padding: 4rem;
      color: var(--text-light);
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
      color: var(--text-light);
    }

    .notifications-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .notification-card {
      background: var(--surface);
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: var(--shadow);
      border: 1px solid var(--border);
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
    }

    .notification-card:hover {
      box-shadow: var(--shadow-lg);
      transform: translateY(-2px);
    }

    .notification-card.unread {
      border-left: 4px solid var(--primary);
      background: rgba(59, 130, 246, 0.05);
    }

    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .notification-header h3 {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text);
      margin: 0;
      flex: 1;
    }

    .notification-meta {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .timestamp {
      font-size: 0.75rem;
      color: var(--text-light);
    }

    .delete-btn {
      background: none;
      border: none;
      color: var(--text-light);
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 4px;
      transition: all 0.2s ease;
    }

    .delete-btn:hover {
      background: var(--error);
      color: white;
    }

    .notification-content p {
      color: var(--text);
      margin-bottom: 1rem;
      line-height: 1.5;
    }

    .from-user {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: var(--text-light);
    }

    .notification-indicator {
      position: absolute;
      top: 1rem;
      right: 1rem;
      width: 8px;
      height: 8px;
      background: var(--primary);
      border-radius: 50%;
    }
  `]
})
export class Notifications implements OnInit {
  currentUser: User | null = null;
  notifications: Notification[] = [];
  isLoading = true;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadNotifications();
  }

  loadNotifications(): void {
    if (this.currentUser) {
      this.notificationService.getUserNotifications(this.currentUser.id).subscribe({
        next: (notifications) => {
          this.notifications = notifications.sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading notifications:', error);
          this.notifications = [];
          this.isLoading = false;
        }
      });
    }
  }

  markAsRead(notification: Notification): void {
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id).subscribe({
        next: () => {
          notification.isRead = true;
        },
        error: (error) => {
          console.error('Error marking notification as read:', error);
        }
      });
    }
  }

  deleteNotification(notification: Notification, event: Event): void {
    event.stopPropagation();
    this.notificationService.deleteNotification(notification.id).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(n => n.id !== notification.id);
      },
      error: (error) => {
        console.error('Error deleting notification:', error);
      }
    });
  }

  formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  }
}