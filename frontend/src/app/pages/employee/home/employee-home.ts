import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BookingService, Booking } from '../../../services/booking.service';
import { AuthService, User } from '../../../services/auth.service';

@Component({
  selector: 'app-employee-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
      <div class="page-header">
        <h1><i class="pi pi-user"></i> Welcome back, {{ currentUser?.userName }}!</h1>
        <p>Here's what's happening with your meetings today</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon"><i class="pi pi-calendar"></i></div>
          <div class="stat-content">
            <div class="stat-number">{{ upcomingBookings.length }}</div>
            <div class="stat-label">Upcoming Meetings</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon"><i class="pi pi-clock"></i></div>
          <div class="stat-content">
            <div class="stat-number">{{ pendingRequests }}</div>
            <div class="stat-label">Pending Requests</div>
          </div>
        </div>
        
        <div class="stat-card">
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
            
            <div *ngFor="let booking of todayBookings" class="booking-item">
              <div class="booking-time">
                {{ formatTime(booking.startTime) }} - {{ formatTime(booking.endTime) }}
              </div>
              <div class="booking-details">
                <div class="booking-title">{{ booking.title }}</div>
                <div class="booking-room"><i class="pi pi-building"></i> {{ booking.roomName }}</div>
              </div>
              <div class="booking-status">
                <span class="status-badge" [class]="'status-' + booking.status.toLowerCase()">
                  {{ booking.status }}
                </span>
              </div>
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

    .booking-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border-radius: 8px;
      border: 1px solid var(--border);
      margin-bottom: 0.75rem;
    }

    .booking-time {
      font-weight: 600;
      color: var(--primary);
      font-size: 0.875rem;
      min-width: 120px;
    }

    .booking-details {
      flex: 1;
    }

    .booking-title {
      font-weight: 600;
      color: var(--text);
      margin-bottom: 0.25rem;
    }

    .booking-room {
      font-size: 0.875rem;
      color: var(--text-light);
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

  constructor(
    private bookingService: BookingService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadBookings();
  }

  loadBookings(): void {
    if (this.currentUser) {
      this.bookingService.getBookingsByUser(this.currentUser.id).subscribe({
        next: (bookings) => {
          this.allBookings = bookings;
          this.filterBookings();
        },
        error: (error) => console.error('Error loading bookings:', error)
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
}