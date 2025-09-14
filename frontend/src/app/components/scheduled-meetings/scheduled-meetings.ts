import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  imports: [CommonModule],
  template: `
    <div class="container">
      <div class="page-header">
        <h1><i class="pi pi-calendar-check"></i> Scheduled Meetings</h1>
        <p>Your upcoming meetings from accepted invitations</p>
      </div>

      <div class="meetings-container">
        <div *ngIf="isLoading" class="loading">
          <div class="loading-spinner"></div>
          <p>Loading scheduled meetings...</p>
        </div>

        <div *ngIf="!isLoading && scheduledMeetings.length === 0" class="empty-state">
          <div class="empty-icon">📭</div>
          <h3>No scheduled meetings</h3>
          <p>You don't have any upcoming meetings.</p>
        </div>

        <div class="meetings-grid" *ngIf="!isLoading && scheduledMeetings.length > 0">
          <div *ngFor="let meeting of scheduledMeetings" class="meeting-card">
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

    .page-header h1 {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 0.5rem;
    }

    .page-header p {
      color: var(--text-light);
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

    .meetings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
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
  `]
})
export class ScheduledMeetings implements OnInit {
  currentUser: User | null = null;
  scheduledMeetings: ScheduledMeeting[] = [];
  isLoading = true;

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
      this.invitationService.getUserInvitations(this.currentUser.id).subscribe({
        next: (invitations) => {
          this.processScheduledMeetings(invitations);
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
    const now = new Date();
    const acceptedInvitations = invitations.filter(inv => inv.status === 1);
    
    const bookingPromises = acceptedInvitations.map(inv => 
      this.bookingService.getAllBookings().toPromise().then(bookings => {
        const booking = bookings?.find(b => b.bookingId === inv.bookingId);
        if (booking && new Date(booking.startTime) > now) {
          return {
            bookingId: inv.bookingId,
            title: inv.bookingTitle,
            organizer: booking.organizerName || 'Unknown',
            startTime: booking.startTime,
            endTime: booking.endTime,
            roomName: booking.roomName || 'Unknown Room'
          } as ScheduledMeeting;
        }
        return null;
      })
    );

    Promise.all(bookingPromises).then(processedMeetings => {
      this.scheduledMeetings = processedMeetings
        .filter(meeting => meeting !== null)
        .sort((a, b) => new Date(a!.startTime).getTime() - new Date(b!.startTime).getTime()) as ScheduledMeeting[];
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
}