import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService, UserInfo } from '../../../services/user.service';
import { AuthService, User } from '../../../services/auth.service';
import { BookingService, BookingResponse } from '../../../services/booking.service';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <div class="page-header">
        <h1>👥 Team Management</h1>
        <p>Manage your team members and their activities</p>
      </div>

      <div class="team-stats">
        <div class="stat-card">
          <div class="stat-number">{{ teamMembers.length }}</div>
          <div class="stat-label">Team Members</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ getActiveBookings() }}</div>
          <div class="stat-label">Active Bookings</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ getPendingRequests() }}</div>
          <div class="stat-label">Pending Requests</div>
        </div>
      </div>

      <div class="team-container">
        <div *ngIf="isLoading" class="loading">
          <div class="loading-spinner"></div>
          <p>Loading team members...</p>
        </div>

        <div *ngIf="!isLoading && teamMembers.length === 0" class="empty-state">
          <div class="empty-icon">👥</div>
          <h3>No team members found</h3>
          <p>You don't have any team members assigned to you.</p>
        </div>

        <div *ngIf="!isLoading && teamMembers.length > 0" class="team-grid">
          <div *ngFor="let member of teamMembers" class="member-card">
            <div class="member-header">
              <div class="member-avatar">{{ getInitials(member.userName) }}</div>
              <div class="member-info">
                <h3>{{ member.userName }}</h3>
                <p class="member-email">{{ member.email }}</p>
                <p class="member-department">{{ member.department }}</p>
              </div>
            </div>
            
            <div class="member-stats">
              <div class="stat-item">
                <span class="stat-value">{{ getMemberBookings(member.id).length }}</span>
                <span class="stat-text">Total Bookings</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ getUpcomingBookings(member.id) }}</span>
                <span class="stat-text">Upcoming</span>
              </div>
            </div>
            
            <div class="member-actions">
              <button class="action-btn" (click)="viewMemberBookings(member)">
                📅 View Bookings
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Member Bookings Modal -->
      <div class="modal-overlay" *ngIf="selectedMember" (click)="closeMemberModal()">
        <div class="modal-card" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ selectedMember.userName }}'s Bookings</h3>
            <button class="close-btn" (click)="closeMemberModal()">×</button>
          </div>
          <div class="modal-body">
            <div *ngIf="selectedMemberBookings.length === 0" class="no-bookings">
              No bookings found for this team member.
            </div>
            <div *ngFor="let booking of selectedMemberBookings" class="booking-item">
              <div class="booking-header">
                <h4>{{ booking.title }}</h4>
                <span class="status-badge" [class]="'status-' + booking.status.toLowerCase()">
                  {{ booking.status }}
                </span>
              </div>
              <div class="booking-details">
                <div class="detail-row">
                  <span class="icon">🏢</span>
                  <span>{{ booking.roomName }}</span>
                </div>
                <div class="detail-row">
                  <span class="icon">📅</span>
                  <span>{{ formatDate(booking.startTime) }}</span>
                </div>
                <div class="detail-row">
                  <span class="icon">🕐</span>
                  <span>{{ formatTimeRange(booking.startTime, booking.endTime) }}</span>
                </div>
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
    }

    .page-header h1 {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 0.5rem;
    }

    .page-header p {
      color: var(--text-light);
      margin-bottom: 2rem;
    }

    .team-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: var(--surface);
      border-radius: 12px;
      padding: 1.5rem;
      text-align: center;
      box-shadow: var(--shadow);
      border: 1px solid var(--border);
    }

    .stat-number {
      font-size: 2rem;
      font-weight: 700;
      color: var(--primary);
      margin-bottom: 0.5rem;
    }

    .stat-label {
      font-size: 0.875rem;
      color: var(--text-light);
      text-transform: uppercase;
      font-weight: 500;
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

    .team-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .member-card {
      background: var(--surface);
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: var(--shadow);
      border: 1px solid var(--border);
      transition: all 0.2s ease;
    }

    .member-card:hover {
      box-shadow: var(--shadow-lg);
      transform: translateY(-2px);
    }

    .member-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .member-avatar {
      width: 50px;
      height: 50px;
      background: var(--primary);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 1.125rem;
    }

    .member-info h3 {
      margin: 0 0 0.25rem 0;
      color: var(--text);
      font-size: 1.125rem;
    }

    .member-email {
      margin: 0 0 0.25rem 0;
      color: var(--text-light);
      font-size: 0.875rem;
    }

    .member-department {
      margin: 0;
      color: var(--primary);
      font-size: 0.875rem;
      font-weight: 500;
    }

    .member-stats {
      display: flex;
      justify-content: space-around;
      margin-bottom: 1rem;
      padding: 1rem;
      background: var(--background);
      border-radius: 8px;
    }

    .stat-item {
      text-align: center;
    }

    .stat-value {
      display: block;
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text);
    }

    .stat-text {
      font-size: 0.75rem;
      color: var(--text-light);
      text-transform: uppercase;
    }

    .member-actions {
      display: flex;
      gap: 0.5rem;
    }

    .action-btn {
      flex: 1;
      padding: 0.75rem;
      background: var(--primary);
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.875rem;
      transition: background-color 0.2s;
    }

    .action-btn:hover {
      background: var(--primary-dark, #2563eb);
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-card {
      background: var(--surface);
      border-radius: 12px;
      width: 90%;
      max-width: 600px;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: var(--shadow-lg);
      border: 1px solid var(--border);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid var(--border);
    }

    .modal-header h3 {
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

    .no-bookings {
      text-align: center;
      color: var(--text-light);
      padding: 2rem;
    }

    .booking-item {
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1rem;
      background: var(--background);
    }

    .booking-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .booking-header h4 {
      margin: 0;
      color: var(--text);
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

    .status-approved, .status-confirmed {
      background: var(--success-bg, #dcfce7);
      color: var(--success-text, #166534);
    }

    .status-rejected, .status-cancelled {
      background: var(--error-bg, #fee2e2);
      color: var(--error-text, #991b1b);
    }

    .booking-details {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .detail-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: var(--text-light);
    }

    .icon {
      font-size: 1rem;
    }

    @media (max-width: 768px) {
      .container {
        padding: 1rem;
      }

      .team-stats {
        grid-template-columns: 1fr;
      }

      .team-grid {
        grid-template-columns: 1fr;
      }

      .member-stats {
        flex-direction: column;
        gap: 1rem;
      }
    }
  `]
})
export class Team implements OnInit {
  currentUser: User | null = null;
  teamMembers: UserInfo[] = [];
  allBookings: BookingResponse[] = [];
  isLoading = true;
  selectedMember: UserInfo | null = null;
  selectedMemberBookings: BookingResponse[] = [];

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadTeamMembers();
    this.loadAllBookings();
  }

  loadTeamMembers(): void {
    if (this.currentUser) {
      this.userService.getTeamMembers(this.currentUser.id).subscribe({
        next: (members: UserInfo[]) => {
          this.teamMembers = members;
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error loading team members:', error);
          this.isLoading = false;
        }
      });
    }
  }

  loadAllBookings(): void {
    this.bookingService.getAllBookings().subscribe({
      next: (bookings: BookingResponse[]) => {
        this.allBookings = bookings;
      },
      error: (error: any) => {
        console.error('Error loading bookings:', error);
      }
    });
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  getMemberBookings(memberId: number): BookingResponse[] {
    return this.allBookings.filter(booking => booking.organizerId === memberId);
  }

  getUpcomingBookings(memberId: number): number {
    const now = new Date();
    return this.getMemberBookings(memberId)
      .filter(booking => new Date(booking.startTime) > now).length;
  }

  getActiveBookings(): number {
    const now = new Date();
    return this.allBookings.filter(booking => 
      this.teamMembers.some(member => member.id === booking.organizerId) &&
      new Date(booking.startTime) > now &&
      (booking.status === 'Scheduled' || booking.status === 'Approved')
    ).length;
  }

  getPendingRequests(): number {
    return this.allBookings.filter(booking => 
      this.teamMembers.some(member => member.id === booking.organizerId) &&
      booking.status === 'Pending'
    ).length;
  }

  viewMemberBookings(member: UserInfo): void {
    this.selectedMember = member;
    this.selectedMemberBookings = this.getMemberBookings(member.id)
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }

  closeMemberModal(): void {
    this.selectedMember = null;
    this.selectedMemberBookings = [];
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
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