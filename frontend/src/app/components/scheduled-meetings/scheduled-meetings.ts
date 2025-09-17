import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../services/auth.service';
import { InvitationService, InvitationResponse } from '../../services/invitation.service';
import { BookingService } from '../../services/booking.service';
import { LoaderService } from '../../services/loader.service';

interface ScheduledMeeting {
  bookingId: string;
  title: string;
  organizer: string;
  startTime: string;
  endTime: string;
  roomName: string;
  status?: string;
}

@Component({
  selector: 'app-scheduled-meetings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="sticky-header" [class.visible]="showStickyHeader">
      <div class="sticky-content">
        <div class="sticky-left">
          <div class="sticky-icon">
            <i class="pi pi-clock"></i>
          </div>
          <h2>Scheduled Meetings</h2>
        </div>
        <div class="sticky-right">
          <div class="quick-actions">
            <button class="action-btn" title="Notifications">
              <i class="pi pi-bell"></i>
              <span class="notification-badge">3</span>
            </button>
            <button class="action-btn" title="Calendar">
              <i class="pi pi-calendar-plus"></i>
            </button>
          </div>
          <div class="user-profile">
            <div class="role-badge">Employee</div>
            <div class="user-avatar">
              <div class="avatar-circle">
                {{ currentUser?.userName?.charAt(0)?.toUpperCase() || 'U' }}
              </div>
              <div class="user-info">
                <span class="user-name">{{ currentUser?.userName || 'User' }}</span>
                <span class="user-dept">{{ currentUser?.department || 'Department' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="container">
      <div class="enhanced-header">
        <div class="header-left">
          <div class="page-icon">
            <i class="pi pi-clock"></i>
          </div>
          <div class="page-info">
            <h1>Scheduled Meetings</h1>
            <p>Your upcoming meetings from accepted invitations</p>
          </div>
        </div>
      </div>

      <div class="filters">
        <div class="filter-buttons">
          <button 
            class="filter-btn"
            [class.active]="activeFilter === 'all'"
            (click)="setFilter('all')"
          >
            All Meetings
          </button>
          <button 
            class="filter-btn"
            [class.active]="activeFilter === 'today'"
            (click)="setFilter('today')"
          >
            Today
          </button>
          <button 
            class="filter-btn"
            [class.active]="activeFilter === 'upcoming'"
            (click)="setFilter('upcoming')"
          >
            Upcoming
          </button>
          <button 
            class="filter-btn"
            [class.active]="activeFilter === 'past'"
            (click)="setFilter('past')"
          >
            Past
          </button>
        </div>
        
        <div class="search-box">
          <input 
            type="text" 
            placeholder="Search meetings..."
            [(ngModel)]="searchTerm"
            (input)="applyFilter()"
          >
          <span class="search-icon"><i class="pi pi-search"></i></span>
        </div>
      </div>

      <div class="meetings-container">


        <div *ngIf="filteredMeetings.length === 0" class="empty-state">
          <div class="empty-icon"><i class="pi pi-inbox"></i></div>
          <h3>No scheduled meetings</h3>
          <p>You don't have any meetings matching the current filter.</p>
        </div>

        <div class="meetings-grid" *ngIf="filteredMeetings.length > 0">
          <div *ngFor="let meeting of filteredMeetings" class="meeting-card">
            <div class="meeting-header">
              <h3>{{ meeting.title }}</h3>
              <div class="header-right">
                <div class="meeting-time">{{ formatTimeRange(meeting.startTime, meeting.endTime) }}</div>
                <span class="status-badge" [class]="'status-' + (meeting.status || 'scheduled').toLowerCase()">
                  {{ meeting.status || 'Scheduled' }}
                </span>
              </div>
            </div>
            
            <div class="meeting-details">
              <div class="detail-item">
                <span class="icon"><i class="pi pi-user"></i></span>
                <span>Organized by: {{ meeting.organizer }}</span>
              </div>
              <div class="detail-item">
                <span class="icon"><i class="pi pi-building"></i></span>
                <span>{{ meeting.roomName }}</span>
              </div>
              <div class="detail-item">
                <span class="icon"><i class="pi pi-calendar"></i></span>
                <span>{{ formatDate(meeting.startTime) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sticky-header {
      position: fixed;
      top: 0;
      left: 280px;
      right: 0;
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      z-index: 999;
      transform: translateY(-100%);
      transition: transform 0.3s ease;
    }

    .sticky-header.visible {
      transform: translateY(0);
    }

    .sticky-content {
      padding: 1rem 2rem;
      max-width: calc(1400px - 280px);
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .sticky-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .sticky-icon {
      background: var(--primary);
      color: white;
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
    }

    .sticky-content h2 {
      margin: 0;
      font-size: 1.3rem;
      font-weight: 600;
      color: var(--text);
    }

    .sticky-right {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .quick-actions {
      display: flex;
      gap: 0.5rem;
    }

    .action-btn {
      position: relative;
      width: 40px;
      height: 40px;
      border-radius: 10px;
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--text);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .action-btn:hover {
      background: var(--primary);
      color: white;
      transform: translateY(-1px);
    }

    .notification-badge {
      position: absolute;
      top: -6px;
      right: -6px;
      background: #ef4444;
      color: white;
      font-size: 0.7rem;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 10px;
      min-width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .user-profile {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .role-badge {
      background: var(--primary);
      color: white;
      padding: 0.4rem 0.8rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .user-avatar {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .avatar-circle {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary), #6366f1);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 1.1rem;
    }

    .user-info {
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-weight: 600;
      color: var(--text);
      font-size: 0.9rem;
    }

    .user-dept {
      font-size: 0.8rem;
      color: var(--text-light);
    }

    @media (max-width: 768px) {
      .sticky-header {
        left: 0;
        top: 70px;
      }
      
      .sticky-content {
        max-width: 100%;
        padding: 1rem;
        flex-direction: column;
        gap: 1rem;
      }
      
      .sticky-right {
        gap: 1rem;
      }
      
      .user-info {
        display: none;
      }
    }

    .container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
      font-family: 'Inter', sans-serif;
    }

    .enhanced-header {
      background: linear-gradient(135deg, var(--surface) 0%, var(--background) 100%);
      border-radius: 16px;
      padding: 1.5rem 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      border: 1px solid var(--border);
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .page-icon {
      background: var(--primary);
      color: white;
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }

    .page-info h1 {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text);
      margin: 0 0 0.25rem 0;
    }

    .page-info p {
      color: var(--text-light);
      margin: 0;
      font-size: 0.9rem;
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
    }

    .filters {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      gap: 1rem;
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
    }

    .filter-btn:hover {
      border-color: var(--primary);
    }

    .filter-btn.active {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
    }

    .search-box {
      position: relative;
    }

    .search-box input {
      padding: 0.5rem 2.5rem 0.5rem 1rem;
      border: 1px solid var(--border);
      border-radius: 8px;
      width: 250px;
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

    .meetings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 1.5rem;
    }

    @media (min-width: 1200px) {
      .meetings-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    @media (max-width: 1199px) and (min-width: 768px) {
      .meetings-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .meeting-card {
      background: var(--surface);
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: var(--shadow);
      border: 1px solid var(--border);
      border-left: 4px solid var(--success);
    }

    .meeting-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .meeting-header h3 {
      margin: 0;
      color: var(--text);
      flex: 1;
    }

    .header-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.5rem;
    }

    .meeting-time {
      color: var(--success);
      font-weight: 500;
      font-size: 0.875rem;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
    }

    .status-scheduled {
      background: var(--success-bg, #dcfce7);
      color: var(--success-text, #166534);
    }

    .status-approved {
      background: var(--success-bg, #dcfce7);
      color: var(--success-text, #166534);
    }

    .status-completed {
      background: var(--info-bg, #e0f2fe);
      color: var(--info-text, #0277bd);
    }

    .meeting-details {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: var(--text-light);
    }

    .icon {
      font-size: 1rem;
      width: 1rem;
    }

    @media (max-width: 768px) {
      .filters {
        flex-direction: column;
        align-items: stretch;
      }

      .search-box input {
        width: 100%;
      }

      .meeting-card {
        padding: 1rem;
        min-height: 140px;
      }

      .meeting-header {
        flex-direction: column;
        align-items: center;
        text-align: center;
        margin-bottom: 0.75rem;
      }

      .meeting-header h3 {
        font-size: 1.1rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
      }

      .meeting-time {
        font-size: 0.8rem;
        color: var(--success);
        font-weight: 600;
      }

      .meeting-details {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .detail-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.8rem;
      }
    }
  `]
})
export class ScheduledMeetings implements OnInit {
  currentUser: User | null = null;
  scheduledMeetings: ScheduledMeeting[] = [];
  filteredMeetings: ScheduledMeeting[] = [];
  isLoading = true;
  activeFilter: 'all' | 'today' | 'upcoming' | 'past' = 'upcoming';
  searchTerm = '';
  showStickyHeader = false;

  constructor(
    private authService: AuthService,
    private invitationService: InvitationService,
    private bookingService: BookingService,
    private loaderService: LoaderService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loaderService.show('Loading scheduled meetings...');
    this.loadScheduledMeetings();
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.showStickyHeader = scrollPosition > 200;
  }

  loadScheduledMeetings(): void {
    if (this.currentUser) {
      // Get accepted invitations using the proper endpoint
      this.invitationService.getInvitationsByStatus(this.currentUser.id, 'Accepted').subscribe({
        next: (acceptedInvitations) => {
          this.processScheduledMeetings(acceptedInvitations);
          this.loaderService.hide();
        },
        error: (error) => {
          console.error('Error loading scheduled meetings:', error);
          this.scheduledMeetings = [];
          this.loaderService.hide();
        }
      });
    }
  }

  processScheduledMeetings(invitations: InvitationResponse[]): void {
    const bookingPromises = invitations.map(inv => 
      this.bookingService.getAllBookings().toPromise().then(bookings => {
        const booking = bookings?.find(b => b.bookingId === inv.bookingId);
        let meeting = {
          bookingId: inv.bookingId,
          title: inv.bookingTitle,
          organizer: booking?.organizerName || 'Unknown',
          startTime: booking?.startTime || '',
          endTime: booking?.endTime || '',
          roomName: booking?.roomName || 'Unknown Room',
          status: booking?.status || 'Scheduled'
        } as ScheduledMeeting & { status: string };
        
        // Update status if meeting has ended for all attendees
        const now = new Date();
        if ((meeting.status === 'Scheduled' || meeting.status === 'Approved') && new Date(meeting.endTime) < now) {
          meeting.status = 'Completed';
        }
        
        return meeting;
      })
    );

    Promise.all(bookingPromises).then(processedMeetings => {
      this.scheduledMeetings = processedMeetings
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
      this.applyFilter();
    });
  }



  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatTimeRange(startTime: string, endTime: string): string {
    const start = new Date(startTime).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    const end = new Date(endTime).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    return `${start} - ${end}`;
  }

  setFilter(filter: 'all' | 'today' | 'upcoming' | 'past'): void {
    this.activeFilter = filter;
    this.applyFilter();
  }

  applyFilter(): void {
    let filtered = [...this.scheduledMeetings];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    // Apply time filter
    if (this.activeFilter === 'today') {
      filtered = filtered.filter(meeting => {
        const meetingDate = new Date(meeting.startTime);
        return meetingDate >= today && meetingDate < tomorrow;
      });
    } else if (this.activeFilter === 'upcoming') {
      filtered = filtered.filter(meeting => {
        const meetingEnd = new Date(meeting.endTime);
        return meetingEnd > now;
      });
    } else if (this.activeFilter === 'past') {
      filtered = filtered.filter(meeting => {
        const meetingEnd = new Date(meeting.endTime);
        return meetingEnd < now;
      });
    }

    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(meeting =>
        meeting.title.toLowerCase().includes(term) ||
        meeting.roomName.toLowerCase().includes(term) ||
        meeting.organizer.toLowerCase().includes(term)
      );
    }

    this.filteredMeetings = filtered;
  }
}