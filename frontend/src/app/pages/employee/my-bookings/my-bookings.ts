import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BookingService, Booking } from '../../../services/booking.service';
import { AuthService, User } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { LoaderService } from '../../../services/loader.service';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="page-header-card">
        <div class="page-header">
          <h1><i class="pi pi-calendar"></i> My Bookings</h1>
          <p>Manage your confirmed meeting room reservations</p>
        </div>
      </div>

      <div class="filters">
        <div class="filter-buttons">
          <button 
            class="filter-btn"
            [class.active]="activeFilter === 'all'"
            (click)="setFilter('all')"
          >
            All Bookings
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
          <button 
            class="filter-btn"
            [class.active]="activeFilter === 'cancelled'"
            (click)="setFilter('cancelled')"
          >
            Cancelled
          </button>
        </div>
        
        <div class="search-box">
          <input 
            type="text" 
            placeholder="Search bookings..."
            [(ngModel)]="searchTerm"
            (input)="filterBookings()"
          >
          <span class="search-icon"><i class="pi pi-search"></i></span>
        </div>
      </div>

      <div class="bookings-container">


        <div *ngIf="filteredBookings.length === 0" class="empty-state">
          <div class="empty-icon"><i class="pi pi-inbox"></i></div>
          <h3>No bookings found</h3>
          <p>You don't have any bookings matching the current filter.</p>
        </div>

        <div class="bookings-grid" *ngIf="filteredBookings.length > 0">
          <div *ngFor="let booking of filteredBookings" class="booking-card">
            <div class="booking-header">
              <div class="booking-date">
                <div class="date-day">{{ formatDate(booking.startTime) }}</div>
                <div class="date-time">{{ formatTimeRange(booking.startTime, booking.endTime) }}</div>
              </div>
              <div class="booking-status">
                <span class="status-badge" [class]="'status-' + booking.status.toLowerCase()">
                  {{ booking.status }}
                </span>
              </div>
            </div>

            <div class="booking-content">
              <h3 class="booking-title">{{ booking.title }}</h3>
              <div class="booking-details">
                <div class="detail-item">
                  <span class="detail-icon"><i class="pi pi-building"></i></span>
                  <span>{{ booking.roomName }}</span>
                </div>
                <div class="detail-item" *ngIf="booking.attendees.length > 0">
                  <span class="detail-icon"><i class="pi pi-users"></i></span>
                  <span>{{ booking.attendees.length }} attendees</span>
                </div>
                <div class="detail-item" *ngIf="booking.isEmergency">
                  <span class="detail-icon"><i class="pi pi-exclamation-triangle"></i></span>
                  <span>Emergency Booking</span>
                </div>
                <div class="detail-item rejection-comment" *ngIf="booking.status === 'Rejected' && getRejectionComment(booking)">
                  <span class="detail-icon"><i class="pi pi-comment"></i></span>
                  <span>Rejection reason: {{ getRejectionComment(booking) }}</span>
                </div>
              </div>
            </div>

            <div class="booking-actions">
              <button class="btn-round btn-primary" (click)="viewBooking(booking)" title="View Details"><i class="pi pi-search"></i></button>
              <button *ngIf="canEdit(booking)" class="btn-round btn-secondary" (click)="editBooking(booking)" title="Edit Booking"><i class="pi pi-file-edit"></i></button>
              <button *ngIf="canCancel(booking)" class="btn-round btn-danger" (click)="cancelBooking(booking)" title="Cancel Booking"><i class="pi pi-trash"></i></button>
              <button *ngIf="canEndEarly(booking)" class="btn-round btn-warning" (click)="endEarly(booking)" title="End Early"><i class="pi pi-stop"></i></button>
              <button *ngIf="canExtend(booking)" class="btn-round btn-success" (click)="extendMeeting(booking)" title="Extend Meeting"><i class="pi pi-plus"></i></button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Booking Details Modal -->
    <div *ngIf="selectedBooking" class="modal-overlay" (click)="closeModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{ selectedBooking.title }}</h2>
          <button class="close-btn" (click)="closeModal()">×</button>
        </div>
        
        <div class="modal-body">
          <div class="detail-section">
            <h4><i class="pi pi-calendar"></i> Schedule</h4>
            <p>{{ formatDate(selectedBooking.startTime) }}</p>
            <p>{{ formatTimeRange(selectedBooking.startTime, selectedBooking.endTime) }}</p>
          </div>
          
          <div class="detail-section">
            <h4><i class="pi pi-building"></i> Room</h4>
            <p>{{ selectedBooking.roomName }}</p>
          </div>
          
          <div class="detail-section" *ngIf="selectedBooking.teamsJoinUrl">
            <h4><i class="pi pi-video"></i> Teams Meeting</h4>
            <a [href]="selectedBooking.teamsJoinUrl" target="_blank" class="teams-link">
              <i class="pi pi-external-link"></i> Join Teams Meeting
            </a>
          </div>
          
          <div class="detail-section" *ngIf="selectedBooking.attendees.length > 0">
            <h4><i class="pi pi-users"></i> Attendees ({{ selectedBooking.attendees.length }})</h4>
            <div class="attendees-list">
              <div *ngFor="let attendee of selectedBooking.attendees" class="attendee-item">
                <span class="attendee-name">{{ getAttendeeName(attendee) }}</span>
                <span class="attendee-role">{{ attendee.roleInMeeting || 'Attendee' }}</span>
                <span class="attendee-status" [class]="'status-' + (attendee.status || 'pending').toLowerCase()">
                  {{ attendee.status || 'Pending' }}
                </span>
              </div>
            </div>
          </div>
          
          <div class="detail-section">
            <h4><i class="pi pi-info-circle"></i> Details</h4>
            <p><strong>Status:</strong> {{ selectedBooking.status }}</p>
            <p><strong>Created:</strong> {{ formatDate(selectedBooking.createdAt) }}</p>
            <p *ngIf="selectedBooking.isEmergency"><strong>Emergency Booking:</strong> Yes</p>
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
    }

    .search-icon {
      position: absolute;
      right: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
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
      color: var(--text-light);
    }

    .empty-icon i {
      font-size: 4rem;
    }

    .bookings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 1.5rem;
    }

    @media (min-width: 1200px) {
      .bookings-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    @media (max-width: 1199px) and (min-width: 768px) {
      .bookings-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .booking-card {
      background: var(--surface);
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: var(--shadow);
      border: 1px solid var(--border);
      border-left: 4px solid var(--primary);
      transition: all 0.2s ease;
    }



    .booking-card:hover {
      box-shadow: var(--shadow-lg);
      transform: translateY(-2px);
    }

    .booking-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .date-day {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text);
    }

    .date-time {
      font-size: 0.875rem;
      color: var(--primary);
      font-weight: 500;
    }

    .booking-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 1rem;
    }

    .booking-details {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: var(--text-light);
    }

    .detail-icon {
      font-size: 1rem;
      width: 1rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .booking-actions {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .action-btn {
      padding: 0.5rem 1rem;
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--text);
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.75rem;
      transition: all 0.2s ease;
    }

    .action-btn:hover {
      background: var(--background);
    }

    .edit-btn:hover {
      border-color: var(--secondary);
      color: var(--secondary);
    }

    .cancel-btn:hover {
      border-color: var(--error);
      color: var(--error);
    }

    .end-btn:hover,
    .extend-btn:hover {
      border-color: var(--warning);
      color: var(--warning);
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: var(--surface);
      border-radius: 12px;
      width: 90%;
      max-width: 600px;
      max-height: 80vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid var(--border);
    }

    .modal-header h2 {
      margin: 0;
      color: var(--text);
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: var(--text-light);
    }

    .modal-body {
      padding: 1.5rem;
    }

    .detail-section {
      margin-bottom: 1.5rem;
    }

    .detail-section h4 {
      margin-bottom: 0.5rem;
      color: var(--text);
    }

    .attendees-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .attendee-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem;
      background: var(--background);
      border-radius: 6px;
    }

    .attendee-name {
      font-weight: 500;
    }

    .attendee-role {
      font-size: 0.875rem;
      color: var(--text-light);
    }

    .attendee-status {
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
    }

    .teams-link {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      background: #6264A7;
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 500;
      transition: background-color 0.2s;
    }

    .teams-link:hover {
      background: #5558A3;
      color: white;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
    }

    .status-pending {
      background: var(--warning-bg, #fef3c7);
      color: var(--warning-text, #92400e);
    }

    .status-approved {
      background: var(--success-bg, #dcfce7);
      color: var(--success-text, #166534);
    }

    .status-confirmed {
      background: var(--success-bg, #dcfce7);
      color: var(--success-text, #166534);
    }

    .status-booked {
      background: var(--success-bg, #dcfce7);
      color: var(--success-text, #166534);
    }

    .status-rejected {
      background: var(--error-bg, #fee2e2);
      color: var(--error-text, #991b1b);
    }

    .status-cancelled {
      background: var(--error-bg, #fee2e2);
      color: var(--error-text, #991b1b);
    }

    .booking-card.status-cancelled {
      opacity: 0.7;
      border-left-color: var(--error);
    }

    .rejection-comment {
      color: var(--error, #ef4444);
      font-weight: 500;
      background: var(--error-bg, #fee2e2);
      padding: 0.5rem;
      border-radius: 6px;
      margin-top: 0.5rem;
    }

    @media (max-width: 768px) {
      .container {
        padding: 1rem;
      }

      .filters {
        flex-direction: column;
        align-items: stretch;
      }

      .search-box input {
        width: 100%;
      }

      .booking-card {
        padding: 1rem;
        min-height: 140px;
      }

      .booking-header {
        flex-direction: row;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 0.75rem;
      }

      .date-day {
        font-size: 0.9rem;
        font-weight: 600;
      }

      .date-time {
        font-size: 0.75rem;
      }

      .booking-title {
        font-size: 1.1rem;
        font-weight: 700;
        text-align: center;
        margin-bottom: 0.75rem;
        color: var(--text);
      }

      .booking-details {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-bottom: 1rem;
      }

      .detail-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.8rem;
      }

      .booking-actions {
        display: flex;
        justify-content: center;
        gap: 0.5rem;
      }

      .btn-round {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .btn-primary {
        background: var(--primary);
        color: white;
      }

      .btn-secondary {
        background: var(--info);
        color: white;
      }

      .btn-danger {
        background: var(--error);
        color: white;
      }

      .btn-warning {
        background: var(--warning);
        color: white;
      }

      .btn-success {
        background: var(--success);
        color: white;
      }

      .status-badge {
        padding: 0.2rem 0.5rem;
        font-size: 0.7rem;
      }

      .status-pending {
        background: #fbbf24;
        color: white;
      }

      .status-approved, .status-confirmed, .status-booked, .status-scheduled {
        background: #10b981;
        color: white;
      }

      .status-rejected, .status-cancelled {
        background: #ef4444;
        color: white;
      }

      .status-completed {
        background: #6b7280;
        color: white;
      }
    }
  `]
})
export class MyBookings implements OnInit {
  currentUser: User | null = null;
  allBookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  cancelledBookings: Booking[] = [];
  activeFilter: 'all' | 'upcoming' | 'past' | 'cancelled' = 'all';
  searchTerm = '';
  isLoading = true;
  selectedBooking: Booking | null = null;

  constructor(
    private bookingService: BookingService,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService,
    private loaderService: LoaderService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadCancelledBookings();
    this.loaderService.show('Loading your bookings...');
    this.loadBookings();
  }

  private updateMeetingStatuses(bookings: Booking[]): Booking[] {
    const now = new Date();
    return bookings.map(booking => {
      if (booking.status === 'Scheduled' && new Date(booking.endTime) < now) {
        return { ...booking, status: 'Completed' as any };
      }
      return booking;
    });
  }

  loadBookings(): void {
    if (this.currentUser) {
      this.bookingService.getBookingsByUser(this.currentUser.id).subscribe({
        next: (bookings) => {
          console.log('All bookings received:', bookings);
          // Only show bookings where current user is the organizer (their own bookings)
          let filteredBookings = bookings
            .filter(booking => booking.organizerId === this.currentUser!.id)
            .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
          
          // Update statuses for completed meetings
          this.allBookings = this.updateMeetingStatuses(filteredBookings);
          
          console.log('Filtered bookings:', this.allBookings);
          this.filterBookings();
          this.loaderService.hide();
        },
        error: (error) => {
          console.error('Error loading bookings:', error);
          this.allBookings = [];
          this.filteredBookings = [];
          this.loaderService.hide();
        }
      });
    } else {
      this.loaderService.hide();
    }
  }

  setFilter(filter: 'all' | 'upcoming' | 'past' | 'cancelled'): void {
    this.activeFilter = filter;
    this.filterBookings();
  }

  filterBookings(): void {
    let filtered = [...this.allBookings];
    const now = new Date();

    // Apply time filter
    if (this.activeFilter === 'upcoming') {
      filtered = filtered.filter(booking => 
        new Date(booking.startTime) > now && 
        booking.status !== 'Cancelled'
      );
    } else if (this.activeFilter === 'past') {
      filtered = filtered.filter(booking => 
        new Date(booking.endTime) < now && 
        booking.status !== 'Cancelled'
      );
    } else if (this.activeFilter === 'cancelled') {
      filtered = this.cancelledBookings;
    }

    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(booking =>
        booking.title.toLowerCase().includes(term) ||
        booking.roomName.toLowerCase().includes(term)
      );
    }

    this.filteredBookings = filtered;
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

  canEdit(booking: Booking): boolean {
    const now = new Date();
    const startTime = new Date(booking.startTime);
    return startTime > now && (booking.status === 'Pending' || booking.status === 'Approved');
  }

  canCancel(booking: Booking): boolean {
    const now = new Date();
    const startTime = new Date(booking.startTime);
    return startTime > now && booking.status !== 'Cancelled' && booking.status !== 'Rejected';
  }

  canEndEarly(booking: Booking): boolean {
    const now = new Date();
    const startTime = new Date(booking.startTime);
    const endTime = new Date(booking.endTime);
    return now >= startTime && now < endTime && booking.status === 'Scheduled';
  }

  canExtend(booking: Booking): boolean {
    const now = new Date();
    const startTime = new Date(booking.startTime);
    const endTime = new Date(booking.endTime);
    return now >= startTime && now < endTime && booking.status === 'Scheduled';
  }

  viewBooking(booking: Booking): void {
    this.selectedBooking = booking;
  }

  editBooking(booking: Booking): void {
    this.router.navigate(['/employee/book-room'], { 
      queryParams: { edit: booking.bookingId } 
    });
  }

  cancelBooking(booking: Booking): void {
    if (confirm('Are you sure you want to cancel this booking?')) {
      const cancelledBooking = { ...booking, status: 'Cancelled' };
      this.cancelledBookings.push({...cancelledBooking, status: cancelledBooking.status as any});
      this.saveCancelledBookings();
      
      this.bookingService.cancelBooking(booking.bookingId).subscribe({
        next: () => {
          this.toastService.success('Booking Cancelled', 'Your booking has been cancelled successfully');
          this.loadBookings();
        },
        error: (error) => {
          this.cancelledBookings = this.cancelledBookings.filter(b => b.bookingId !== booking.bookingId);
          this.saveCancelledBookings();
          this.toastService.error('Error', 'Failed to cancel booking');
          console.error('Error cancelling booking:', error);
        }
      });
    }
  }

  endEarly(booking: Booking): void {
    if (confirm('Are you sure you want to end this meeting early?')) {
      this.bookingService.endMeetingEarly(booking.bookingId).subscribe({
        next: () => {
          this.loadBookings();
        },
        error: (error) => {
          console.error('Error ending meeting early:', error);
        }
      });
    }
  }

  extendMeeting(booking: Booking): void {
    const newEndTime = prompt('Enter new end time (HH:MM):');
    if (newEndTime) {
      const today = new Date(booking.endTime);
      const [hours, minutes] = newEndTime.split(':');
      today.setHours(parseInt(hours), parseInt(minutes));
      
      this.bookingService.extendMeeting(booking.bookingId, today.toISOString()).subscribe({
        next: () => {
          this.loadBookings();
        },
        error: (error) => {
          console.error('Error extending meeting:', error);
        }
      });
    }
  }

  closeModal(): void {
    this.selectedBooking = null;
  }

  getRejectionComment(booking: Booking): string {
    return (booking as any).rejectionComment || '';
  }

  loadCancelledBookings(): void {
    const stored = localStorage.getItem(`cancelledBookings_${this.currentUser?.id}`);
    if (stored) {
      this.cancelledBookings = JSON.parse(stored);
    }
  }

  saveCancelledBookings(): void {
    localStorage.setItem(`cancelledBookings_${this.currentUser?.id}`, JSON.stringify(this.cancelledBookings));
  }

  getAttendeeName(attendee: any): string {
    return attendee.userName || attendee.name || attendee || 'Unknown';
  }
}