import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../services/auth.service';
import { NotificationService, Notification } from '../../services/notification.service';
import { BookingService } from '../../services/booking.service';
import { LoaderService } from '../../services/loader.service';
import { interval, Subscription } from 'rxjs';

interface GroupedNotifications {
  today: Notification[];
  thisWeek: Notification[];
  earlier: Notification[];
}

interface UpcomingMeeting {
  title: string;
  startTime: string;
  roomName: string;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="page-header-card">
        <div class="page-header">
          <h1><i class="pi pi-bell"></i> Notifications</h1>
          <p>Stay updated with your meeting activities</p>
        </div>
      </div>

      <div class="layout-container">
        <div class="main-section">
          <div class="controls-bar">
            <div class="filter-buttons">
              <button class="filter-btn" [class.active]="activeFilter === 'all'" (click)="setFilter('all')">All</button>
              <button class="filter-btn" [class.active]="activeFilter === 'invitations'" (click)="setFilter('invitations')">Invitations</button>
              <button class="filter-btn" [class.active]="activeFilter === 'updates'" (click)="setFilter('updates')">Updates</button>
              <button class="filter-btn" [class.active]="activeFilter === 'system'" (click)="setFilter('system')">System Alerts</button>
            </div>
            <div class="search-box">
              <input type="text" [(ngModel)]="searchTerm" (input)="filterNotifications()" 
                     placeholder="Search notifications..." class="search-input">
              <i class="pi pi-search search-icon"></i>
            </div>
          </div>

          <div class="notifications-section">
          <div *ngIf="filteredNotifications.length === 0" class="empty-state">
            <div class="empty-icon">🎉</div>
            <h3>You're all caught up!</h3>
            <p>No new notifications.</p>
          </div>

          <div *ngIf="filteredNotifications.length > 0">
            <!-- Today Section -->
            <div *ngIf="groupedNotifications.today.length > 0" class="notification-group">
              <h3 class="group-title">Today</h3>
              <div class="notifications-list">
                <div *ngFor="let notification of groupedNotifications.today" 
                     class="notification-card" 
                     [class.unread]="!notification.isRead"
                     (click)="markAsRead(notification)">
                  <div class="notification-icon" [class]="getNotificationType(notification)">
                    <i [class]="getNotificationIcon(getNotificationType(notification))"></i>
                  </div>
                  <div class="notification-content">
                    <div class="notification-header">
                      <h4>{{ notification.title }}</h4>
                      <div class="notification-meta">
                        <span class="status-tag" [class]="getStatusClass(getNotificationType(notification))">{{ getStatusText(getNotificationType(notification)) }}</span>
                        <span class="timestamp">{{ formatTime(notification.createdAt) }}</span>
                        <button class="delete-btn" (click)="deleteNotification(notification, $event)">
                          <i class="pi pi-times"></i>
                        </button>
                      </div>
                    </div>
                    <p>{{ notification.message }}</p>
                  </div>
                  <div class="unread-indicator" *ngIf="!notification.isRead"></div>
                </div>
              </div>
            </div>

            <!-- This Week Section -->
            <div *ngIf="groupedNotifications.thisWeek.length > 0" class="notification-group">
              <h3 class="group-title">This Week</h3>
              <div class="notifications-list">
                <div *ngFor="let notification of groupedNotifications.thisWeek" 
                     class="notification-card" 
                     [class.unread]="!notification.isRead"
                     (click)="markAsRead(notification)">
                  <div class="notification-icon" [class]="getNotificationType(notification)">
                    <i [class]="getNotificationIcon(getNotificationType(notification))"></i>
                  </div>
                  <div class="notification-content">
                    <div class="notification-header">
                      <h4>{{ notification.title }}</h4>
                      <div class="notification-meta">
                        <span class="status-tag" [class]="getStatusClass(getNotificationType(notification))">{{ getStatusText(getNotificationType(notification)) }}</span>
                        <span class="timestamp">{{ formatTime(notification.createdAt) }}</span>
                        <button class="delete-btn" (click)="deleteNotification(notification, $event)">
                          <i class="pi pi-times"></i>
                        </button>
                      </div>
                    </div>
                    <p>{{ notification.message }}</p>
                  </div>
                  <div class="unread-indicator" *ngIf="!notification.isRead"></div>
                </div>
              </div>
            </div>

            <!-- Earlier Section -->
            <div *ngIf="groupedNotifications.earlier.length > 0" class="notification-group">
              <h3 class="group-title">Earlier</h3>
              <div class="notifications-list">
                <div *ngFor="let notification of groupedNotifications.earlier" 
                     class="notification-card" 
                     [class.unread]="!notification.isRead"
                     (click)="markAsRead(notification)">
                  <div class="notification-icon" [class]="getNotificationType(notification)">
                    <i [class]="getNotificationIcon(getNotificationType(notification))"></i>
                  </div>
                  <div class="notification-content">
                    <div class="notification-header">
                      <h4>{{ notification.title }}</h4>
                      <div class="notification-meta">
                        <span class="status-tag" [class]="getStatusClass(getNotificationType(notification))">{{ getStatusText(getNotificationType(notification)) }}</span>
                        <span class="timestamp">{{ formatTime(notification.createdAt) }}</span>
                        <button class="delete-btn" (click)="deleteNotification(notification, $event)">
                          <i class="pi pi-times"></i>
                        </button>
                      </div>
                    </div>
                    <p>{{ notification.message }}</p>
                  </div>
                  <div class="unread-indicator" *ngIf="!notification.isRead"></div>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
        
        <div class="sidebar">
          <div class="mini-calendar">
            <h4>Upcoming Meetings</h4>
            <div *ngIf="upcomingMeetings.length === 0" class="no-meetings">
              <p>No upcoming meetings</p>
            </div>
            <div *ngFor="let meeting of upcomingMeetings" class="meeting-item">
              <div class="meeting-time">{{ formatMeetingTime(meeting.startTime) }}</div>
              <div class="meeting-title">{{ meeting.title }}</div>
              <div class="meeting-room">{{ meeting.roomName }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      padding: 2rem;
      max-width: 1200px;
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

    .layout-container {
      display: flex;
      gap: 2rem;
    }

    .main-section {
      flex: 1;
    }

    .sidebar {
      width: 300px;
      flex-shrink: 0;
    }

    .controls-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
      gap: 2rem;
    }

    .filter-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .filter-btn {
      padding: 0.5rem 1rem;
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--text);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 0.875rem;
    }

    .filter-btn:hover {
      border-color: var(--primary);
    }

    .filter-btn.active {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
    }

    .mini-calendar {
      background: var(--surface);
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: var(--shadow);
      border: 1px solid var(--border);
      min-width: 300px;
    }

    .mini-calendar h4 {
      margin: 0 0 1rem 0;
      color: var(--text);
      font-size: 1rem;
    }

    .meeting-item {
      padding: 0.75rem;
      border-radius: 8px;
      background: var(--background);
      margin-bottom: 0.75rem;
      border-left: 3px solid var(--primary);
    }

    .meeting-time {
      font-size: 0.75rem;
      color: var(--primary);
      font-weight: 600;
    }

    .meeting-title {
      font-size: 0.875rem;
      color: var(--text);
      font-weight: 500;
      margin: 0.25rem 0;
    }

    .meeting-room {
      font-size: 0.75rem;
      color: var(--text-light);
    }

    .no-meetings {
      text-align: center;
      color: var(--text-light);
      font-size: 0.875rem;
    }

    .notifications-section {
      margin-top: 0;
    }

    .search-box {
      position: relative;
      max-width: 400px;
    }

    .search-input {
      width: 100%;
      padding: 0.75rem 2.5rem 0.75rem 1rem;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: var(--surface);
      color: var(--text);
    }

    .search-icon {
      position: absolute;
      right: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-light);
    }

    .notification-group {
      margin-bottom: 2rem;
    }

    .group-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid var(--border);
    }

    .empty-state {
      text-align: center;
      padding: 4rem;
      color: var(--text-light);
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .notifications-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .notification-card {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      background: var(--surface);
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: var(--shadow);
      border: 1px solid var(--border);
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
      margin-bottom: 1rem;
    }

    .notification-card:hover {
      box-shadow: var(--shadow-lg);
      transform: translateY(-2px);
    }

    .notification-card.unread {
      border-left: 4px solid var(--primary);
      background: rgba(59, 130, 246, 0.05);
      font-weight: 600;
    }

    .notification-card:not(.unread) {
      opacity: 0.8;
    }

    .notification-card:not(.unread):hover {
      opacity: 1;
    }

    .notification-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      flex-shrink: 0;
    }

    .notification-icon.invitation {
      background: rgba(59, 130, 246, 0.1);
      color: var(--primary);
    }

    .notification-icon.update {
      background: rgba(16, 185, 129, 0.1);
      color: var(--success);
    }

    .notification-icon.system {
      background: rgba(245, 158, 11, 0.1);
      color: var(--warning);
    }

    .notification-icon.reminder {
      background: rgba(139, 92, 246, 0.1);
      color: var(--purple);
    }

    .notification-content {
      flex: 1;
    }

    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.5rem;
    }

    .notification-header h4 {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text);
      margin: 0;
      flex: 1;
    }

    .notification-meta {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .status-tag {
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .status-tag.accepted {
      background: var(--success-bg);
      color: var(--success-text);
    }

    .status-tag.rejected {
      background: var(--error-bg);
      color: var(--error-text);
    }

    .status-tag.pending {
      background: var(--warning-bg);
      color: var(--warning-text);
    }

    .status-tag.system {
      background: rgba(139, 92, 246, 0.1);
      color: var(--purple);
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
      color: var(--text-light);
      margin-bottom: 0;
      line-height: 1.5;
      font-size: 0.875rem;
    }

    .unread-indicator {
      position: absolute;
      top: 1rem;
      right: 1rem;
      width: 8px;
      height: 8px;
      background: var(--primary);
      border-radius: 50%;
      animation: pulse-dot 2s infinite;
    }



    @keyframes pulse-dot {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    @media (max-width: 768px) {
      .layout-container {
        flex-direction: column;
      }
      
      .sidebar {
        width: auto;
      }
      
      .controls-bar {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
      }
      
      .filter-buttons {
        flex-wrap: wrap;
      }
      
      .search-box {
        max-width: none;
      }
    }
  `]
})
export class Notifications implements OnInit, OnDestroy {
  currentUser: User | null = null;
  notifications: Notification[] = [];
  filteredNotifications: Notification[] = [];
  groupedNotifications: GroupedNotifications = { today: [], thisWeek: [], earlier: [] };
  upcomingMeetings: UpcomingMeeting[] = [];
  searchTerm = '';
  activeFilter: 'all' | 'invitations' | 'updates' | 'system' = 'all';
  isLoading = true;
  private pollSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private bookingService: BookingService,
    private loaderService: LoaderService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loaderService.show('Loading notifications...');
    this.loadNotifications();
    this.loadUpcomingMeetings();
    // Poll for new notifications every 30 seconds
    this.pollSubscription = interval(30000).subscribe(() => {
      this.loadNotifications();
      this.loadUpcomingMeetings();
    });
  }

  ngOnDestroy(): void {
    this.pollSubscription?.unsubscribe();
  }

  loadNotifications(): void {
    if (this.currentUser) {
      this.notificationService.getUserNotifications(this.currentUser.id).subscribe({
        next: (notifications) => {
          this.notifications = notifications.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          this.filterNotifications();
          this.loaderService.hide();
        },
        error: (error) => {
          console.error('Error loading notifications:', error);
          this.notifications = [];
          this.filterNotifications();
          this.loaderService.hide();
        }
      });
    }
  }

  loadUpcomingMeetings(): void {
    if (this.currentUser) {
      this.bookingService.getBookingsByUser(this.currentUser.id).subscribe({
        next: (bookings) => {
          const now = new Date();
          this.upcomingMeetings = bookings
            .filter(booking => new Date(booking.startTime) > now)
            .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
            .slice(0, 5)
            .map(booking => ({
              title: booking.title,
              startTime: booking.startTime,
              roomName: booking.roomName
            }));
        },
        error: (error) => {
          console.error('Error loading upcoming meetings:', error);
          this.upcomingMeetings = [];
        }
      });
    }
  }

  setFilter(filter: 'all' | 'invitations' | 'updates' | 'system'): void {
    this.activeFilter = filter;
    this.filterNotifications();
  }

  filterNotifications(): void {
    let filtered = [...this.notifications];
    
    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(term) ||
        notification.message.toLowerCase().includes(term)
      );
    }
    
    // Apply type filter
    if (this.activeFilter !== 'all') {
      filtered = filtered.filter(notification => {
        const type = this.getNotificationType(notification);
        return type === this.activeFilter;
      });
    }
    
    this.filteredNotifications = filtered;
    this.groupNotificationsByDate();
  }

  groupNotificationsByDate(): void {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    this.groupedNotifications = {
      today: [],
      thisWeek: [],
      earlier: []
    };
    
    this.filteredNotifications.forEach(notification => {
      const notificationDate = new Date(notification.createdAt);
      const notificationDay = new Date(notificationDate.getFullYear(), notificationDate.getMonth(), notificationDate.getDate());
      
      if (notificationDay.getTime() === today.getTime()) {
        this.groupedNotifications.today.push(notification);
      } else if (notificationDay >= weekAgo) {
        this.groupedNotifications.thisWeek.push(notification);
      } else {
        this.groupedNotifications.earlier.push(notification);
      }
    });
  }

  getNotificationIcon(type: string): string {
    switch (type?.toLowerCase()) {
      case 'invitation': return 'pi pi-envelope';
      case 'approval': return 'pi pi-check-circle';
      case 'cancellation': return 'pi pi-times-circle';
      case 'reminder': return 'pi pi-bell';
      case 'update': return 'pi pi-info-circle';
      default: return 'pi pi-bell';
    }
  }

  getNotificationType(notification: Notification): string {
    const title = notification.title.toLowerCase();
    if (title.includes('invitation') || title.includes('invite')) return 'invitations';
    if (title.includes('update') || title.includes('changed')) return 'updates';
    if (title.includes('system') || title.includes('alert')) return 'system';
    return 'updates';
  }

  getStatusClass(type: string): string {
    switch (type?.toLowerCase()) {
      case 'accepted': return 'accepted';
      case 'rejected': return 'rejected';
      case 'pending': return 'pending';
      default: return 'system';
    }
  }

  getStatusText(type: string): string {
    switch (type?.toLowerCase()) {
      case 'invitation': return 'Invite';
      case 'approval': return 'Approved';
      case 'cancellation': return 'Cancelled';
      case 'reminder': return 'Reminder';
      case 'update': return 'Update';
      default: return 'Info';
    }
  }

  isInvitation(notification: Notification): boolean {
    return notification.title.toLowerCase().includes('invitation') || 
           notification.title.toLowerCase().includes('invite');
  }

  acceptInvitation(notification: Notification, event: Event): void {
    event.stopPropagation();
    // Implementation for accepting invitation
    console.log('Accept invitation:', notification);
  }

  rejectInvitation(notification: Notification, event: Event): void {
    event.stopPropagation();
    // Implementation for rejecting invitation
    console.log('Reject invitation:', notification);
  }

  viewDetails(notification: Notification, event: Event): void {
    event.stopPropagation();
    // Implementation for viewing details
    console.log('View details:', notification);
  }

  formatMeetingTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    if (isToday) {
      return `Today ${timeStr}`;
    } else {
      return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${timeStr}`;
    }
  }

  markAsRead(notification: Notification): void {
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.notificationId).subscribe({
        next: () => {
          notification.isRead = true;
          // Trigger a refresh to update the unread count in the sidebar
          window.dispatchEvent(new CustomEvent('notificationRead'));
        },
        error: (error) => {
          console.error('Error marking notification as read:', error);
        }
      });
    }
  }

  deleteNotification(notification: Notification, event: Event): void {
    event.stopPropagation();
    this.notificationService.deleteNotification(notification.notificationId).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(n => n.notificationId !== notification.notificationId);
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