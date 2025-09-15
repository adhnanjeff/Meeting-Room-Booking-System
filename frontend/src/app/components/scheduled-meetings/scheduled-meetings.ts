import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../services/auth.service';
import { InvitationService, InvitationResponse } from '../../services/invitation.service';
import { BookingService } from '../../services/booking.service';

interface ScheduledMeeting {
  bookingId: string;
  title: string;
  organizer: string;
  startTime: string;
  endTime: string;
  roomName: string;
}

@Component({
  selector: 'app-scheduled-meetings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="page-header-card">
        <div class="page-header">
          <h1><i class="pi pi-calendar-check"></i> Scheduled Meetings</h1>
          <p>Your upcoming meetings from accepted invitations</p>
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
        <div *ngIf="isLoading" class="loading">
          <div class="loading-spinner"></div>
          <p>Loading scheduled meetings...</p>
        </div>

        <div *ngIf="!isLoading && filteredMeetings.length === 0" class="empty-state">
          <div class="empty-icon">📭</div>
          <h3>No scheduled meetings</h3>
          <p>You don't have any meetings matching the current filter.</p>
        </div>

        <div class="meetings-grid" *ngIf="!isLoading && filteredMeetings.length > 0">
          <div *ngFor="let meeting of filteredMeetings" class="meeting-card">
            <div class="meeting-header">
              <h3>{{ meeting.title }}</h3>
              <div class="meeting-time">{{ formatTimeRange(meeting.startTime, meeting.endTime) }}</div>
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
    .container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
      font-family: 'Inter', sans-serif;
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
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
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
      align-items: center;
      margin-bottom: 1rem;
    }

    .meeting-header h3 {
      margin: 0;
      color: var(--text);
    }

    .meeting-time {
      color: var(--success);
      font-weight: 500;
      font-size: 0.875rem;
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

      .meetings-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 1024px) {
      .meetings-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class ScheduledMeetings implements OnInit {
  currentUser: User | null = null;
  scheduledMeetings: ScheduledMeeting[] = [];
  filteredMeetings: ScheduledMeeting[] = [];
  isLoading = true;
  activeFilter: 'all' | 'today' | 'upcoming' | 'past' = 'all';
  searchTerm = '';

  constructor(
    private authService: AuthService,
    private invitationService: InvitationService,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadScheduledMeetings();
  }

  loadScheduledMeetings(): void {
    if (this.currentUser) {
      // Get accepted invitations using the proper endpoint
      this.invitationService.getInvitationsByStatus(this.currentUser.id, 'Accepted').subscribe({
        next: (acceptedInvitations) => {
          this.processScheduledMeetings(acceptedInvitations);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading scheduled meetings:', error);
          this.scheduledMeetings = [];
          this.isLoading = false;
        }
      });
    }
  }

  processScheduledMeetings(invitations: InvitationResponse[]): void {
    const bookingPromises = invitations.map(inv => 
      this.bookingService.getAllBookings().toPromise().then(bookings => {
        const booking = bookings?.find(b => b.bookingId === inv.bookingId);
        return {
          bookingId: inv.bookingId,
          title: inv.bookingTitle,
          organizer: booking?.organizerName || 'Unknown',
          startTime: booking?.startTime || '',
          endTime: booking?.endTime || '',
          roomName: booking?.roomName || 'Unknown Room'
        } as ScheduledMeeting;
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
      filtered = filtered.filter(meeting => new Date(meeting.startTime) > now);
    } else if (this.activeFilter === 'past') {
      filtered = filtered.filter(meeting => new Date(meeting.endTime) < now);
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