import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BookingService, Booking } from '../../../services/booking.service';
import { AuthService, User } from '../../../services/auth.service';
import { LoaderService } from '../../../services/loader.service';

@Component({
  selector: 'app-employee-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
      <div class="page-header">
        <h1><i class="pi pi-user"></i> Welcome back, <span class="username-gradient">{{ currentUser?.userName }}</span>!</h1>
        <p>Here's what's happening with your meetings today</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card red-strip">
          <div class="stat-icon"><i class="pi pi-calendar"></i></div>
          <div class="stat-content">
            <div class="stat-number">{{ upcomingBookings.length }}</div>
            <div class="stat-label">Upcoming Meetings</div>
          </div>
        </div>
        
        <div class="stat-card yellow-strip">
          <div class="stat-icon"><i class="pi pi-clock"></i></div>
          <div class="stat-content">
            <div class="stat-number">{{ pendingRequests }}</div>
            <div class="stat-label">Pending Requests</div>
          </div>
        </div>
        
        <div class="stat-card green-strip">
          <div class="stat-icon"><i class="pi pi-building"></i></div>
          <div class="stat-content">
            <div class="stat-number">{{ availableRooms }}</div>
            <div class="stat-label">Available Rooms</div>
          </div>
        </div>
      </div>

      <div class="content-grid">
        <div class="card">
          <div class="card-header">
            <h3><i class="pi pi-calendar"></i> Today's Schedule</h3>
          </div>
          <div class="card-content">
            <div *ngIf="todayBookings.length === 0" class="empty-state">
              <div class="empty-icon"><i class="pi pi-inbox"></i></div>
              <p>No meetings scheduled for today</p>
            </div>
            
            <div *ngIf="todayBookings.length > 0" class="meetings-table">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Time</th>
                    <th>Location</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let booking of todayBookings" 
                      class="meeting-row"
                      (mouseenter)="showMeetingTooltip($event, booking)"
                      (mouseleave)="hideMeetingTooltip()">
                    <td class="meeting-title">{{ booking.title }}</td>
                    <td class="meeting-time">{{ formatTime(booking.startTime) }} - {{ formatTime(booking.endTime) }}</td>
                    <td class="meeting-location">{{ booking.roomName }}</td>
                    <td><span class="status-badge" [class]="'status-' + booking.status.toLowerCase()">{{ booking.status }}</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Meeting Details Tooltip -->
        <div class="meeting-tooltip" 
             *ngIf="hoveredMeeting" 
             [style.left.px]="tooltipPosition.x" 
             [style.top.px]="tooltipPosition.y">
          <div class="tooltip-header">
            <h4>{{ hoveredMeeting.title }}</h4>
          </div>
          <div class="tooltip-content">
            <div class="tooltip-row">
              <span class="label">Time:</span>
              <span>{{ formatTime(hoveredMeeting.startTime) }} - {{ formatTime(hoveredMeeting.endTime) }}</span>
            </div>
            <div class="tooltip-row">
              <span class="label">Location:</span>
              <span>{{ hoveredMeeting.roomName }}</span>
            </div>
            <div class="tooltip-row">
              <span class="label">Organizer:</span>
              <span>{{ hoveredMeeting.organizerName || currentUser?.userName || 'You' }}</span>
            </div>
            <div class="tooltip-row" *ngIf="hoveredMeeting.attendees">
              <span class="label">Attendees:</span>
              <span>{{ formatAttendees(hoveredMeeting.attendees) }}</span>
            </div>
            <div class="tooltip-row" *ngIf="hoveredMeeting.description">
              <span class="label">Description:</span>
              <span>{{ hoveredMeeting.description }}</span>
            </div>
            <div class="tooltip-row" *ngIf="hoveredMeeting.teamsJoinUrl">
              <span class="label">Teams:</span>
              <a [href]="hoveredMeeting.teamsJoinUrl" target="_blank" class="teams-link">
                <i class="pi pi-microsoft"></i> Join Meeting
              </a>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3><i class="pi pi-bolt"></i> Quick Actions</h3>
          </div>
          <div class="card-content">
            <div class="action-buttons">
              <a routerLink="../book-room" class="action-btn primary">
                <span class="action-icon"><i class="pi pi-plus"></i></span>
                <div class="action-content">
                  <div class="action-title">Book a Room</div>
                  <div class="action-desc">Schedule a new meeting</div>
                </div>
              </a>
              
              <a routerLink="../my-bookings" class="action-btn">
                <span class="action-icon"><i class="pi pi-list"></i></span>
                <div class="action-content">
                  <div class="action-title">My Bookings</div>
                  <div class="action-desc">View all meetings</div>
                </div>
              </a>
              
              <a routerLink="../my-requests" class="action-btn">
                <span class="action-icon"><i class="pi pi-inbox"></i></span>
                <div class="action-content">
                  <div class="action-title">My Requests</div>
                  <div class="action-desc">Check approval status</div>
                </div>
              </a>
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

    .page-header {
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
      font-size: 1rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: var(--surface);
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: var(--shadow);
      border: 1px solid var(--border);
      display: flex;
      align-items: center;
      gap: 1rem;
      position: relative;
    }

    .stat-card.red-strip::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 4px;
      height: 100%;
      background: #ef4444;
      border-radius: 12px 0 0 12px;
    }

    .stat-card.yellow-strip::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 4px;
      height: 100%;
      background: #f59e0b;
      border-radius: 12px 0 0 12px;
    }

    .stat-card.green-strip::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 4px;
      height: 100%;
      background: #10b981;
      border-radius: 12px 0 0 12px;
    }

    .username-gradient {
      background: linear-gradient(135deg, var(--primary), #4099ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .stat-icon {
      font-size: 2rem;
      background: var(--background);
      padding: 0.75rem;
      border-radius: 12px;
    }

    .stat-number {
      font-size: 1.875rem;
      font-weight: 700;
      color: var(--text);
    }

    .stat-label {
      font-size: 0.875rem;
      color: var(--text-light);
    }

    .content-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 2rem;
    }

    .card {
      background: var(--surface);
      border-radius: 12px;
      box-shadow: var(--shadow);
      border: 1px solid var(--border);
    }

    .card-header {
      padding: 1.5rem 1.5rem 0;
    }

    .card-header h3 {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text);
    }

    .card-content {
      padding: 1.5rem;
    }

    .empty-state {
      text-align: center;
      padding: 2rem;
      color: var(--text-light);
    }

    .empty-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .meetings-table {
      overflow-x: auto;
    }

    .meetings-table table {
      width: 100%;
      border-collapse: collapse;
    }

    .meetings-table th {
      background: var(--background);
      padding: 0.75rem;
      text-align: left;
      font-weight: 600;
      color: var(--text);
      border-bottom: 2px solid var(--border);
      font-size: 0.875rem;
    }

    .meetings-table td {
      padding: 0.75rem;
      border-bottom: 1px solid var(--border);
      font-size: 0.875rem;
    }

    .meeting-row {
      transition: all 0.2s ease;
      cursor: pointer;
    }

    .meeting-row:hover {
      background: var(--background);
    }

    .meeting-title {
      font-weight: 500;
      color: var(--text);
    }

    .meeting-time {
      color: var(--primary);
      font-weight: 500;
    }

    .meeting-location {
      color: var(--text-light);
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
    }

    .status-badge.status-pending {
      background: var(--warning-light, #fef3c7);
      color: var(--warning-dark, #92400e);
    }

    .status-badge.status-approved {
      background: var(--success-light, #d1fae5);
      color: var(--success-dark, #065f46);
    }

    .status-badge.status-rejected {
      background: var(--error-light, #fee2e2);
      color: var(--error-dark, #991b1b);
    }

    .meeting-tooltip {
      position: fixed;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
      padding: 1rem;
      z-index: 1000;
      max-width: 300px;
      pointer-events: none;
    }

    .tooltip-header h4 {
      margin: 0 0 0.75rem 0;
      color: var(--text);
      font-size: 1rem;
    }

    .tooltip-row {
      display: flex;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
    }

    .tooltip-row .label {
      font-weight: 600;
      color: var(--text);
      min-width: 80px;
      margin-right: 0.5rem;
    }

    .tooltip-row span:last-child {
      color: var(--text-light);
    }

    .teams-link {
      color: #5865f2;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .teams-link:hover {
      text-decoration: underline;
    }

    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border-radius: 8px;
      border: 1px solid var(--border);
      text-decoration: none;
      color: var(--text);
      transition: all 0.2s ease;
    }

    .action-btn:hover {
      border-color: var(--primary);
      background: var(--background);
    }

    .action-btn.primary {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
    }

    .action-btn.primary:hover {
      background: #1d4ed8;
    }

    .action-icon {
      font-size: 1.5rem;
    }

    .action-title {
      font-weight: 600;
      margin-bottom: 0.25rem;
    }

    .action-desc {
      font-size: 0.875rem;
      color: var(--text-light);
    }

    .action-btn.primary .action-desc {
      color: rgba(255, 255, 255, 0.8);
    }

    @media (max-width: 768px) {
      .container {
        padding: 1rem;
      }

      .content-grid {
        grid-template-columns: 1fr;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class EmployeeHome implements OnInit {
  currentUser: User | null = null;
  allBookings: Booking[] = [];
  upcomingBookings: Booking[] = [];
  todayBookings: Booking[] = [];
  pendingRequests = 0;
  availableRooms = 5;
  hoveredMeeting: any = null;
  tooltipPosition = { x: 0, y: 0 };
  isLoading = false;
  loadingMessage = '';

  constructor(
    private bookingService: BookingService,
    private authService: AuthService,
    private loaderService: LoaderService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loaderService.show('Loading your bookings...');
    this.loadBookings();
  }

  loadBookings(): void {
    if (this.currentUser) {
      this.bookingService.getBookingsByUser(this.currentUser.id).subscribe({
        next: (bookings) => {
          this.allBookings = bookings;
          this.filterBookings();
          this.loaderService.hide();
        },
        error: (error) => {
          console.error('Error loading bookings:', error);
          this.loaderService.hide();
        }
      });
    }
  }

  filterBookings(): void {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    this.upcomingBookings = this.allBookings.filter(booking => 
      new Date(booking.startTime) > now
    );

    this.todayBookings = this.allBookings.filter(booking => {
      const bookingDate = new Date(booking.startTime);
      return bookingDate >= today && bookingDate < tomorrow;
    });

    this.pendingRequests = this.allBookings.filter(booking => 
      booking.status === 'Pending'
    ).length;
  }

  formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  showMeetingTooltip(event: MouseEvent, meeting: any): void {
    this.hoveredMeeting = meeting;
    this.tooltipPosition = {
      x: event.clientX + 10,
      y: event.clientY - 10
    };
  }

  hideMeetingTooltip(): void {
    this.hoveredMeeting = null;
  }

  formatAttendees(attendees: any): string {
    if (!attendees) return 'None';
    if (typeof attendees === 'string') return attendees;
    if (Array.isArray(attendees)) {
      return attendees.map(a => typeof a === 'object' ? a.name || a.email || a.userName : a).join(', ');
    }
    if (typeof attendees === 'object') {
      return attendees.name || attendees.email || attendees.userName || 'Unknown';
    }
    return String(attendees);
  }


}