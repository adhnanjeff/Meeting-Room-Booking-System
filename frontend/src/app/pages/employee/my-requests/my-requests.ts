import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BookingService, Booking } from '../../../services/booking.service';
import { AuthService, User } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-my-requests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="page-header">
        <h1><i class="pi pi-clock"></i> My Requests</h1>
        <p>Track your pending and processed booking requests</p>
      </div>

      <div class="requests-container">
        <div *ngIf="isLoading" class="loading">
          <div class="loading-spinner"></div>
          <p>Loading your requests...</p>
        </div>

        <div *ngIf="!isLoading && requests.length === 0" class="empty-state">
          <div class="empty-icon"><i class="pi pi-inbox"></i></div>
          <h3>No requests found</h3>
          <p>You don't have any booking requests.</p>
        </div>

        <div class="requests-grid" *ngIf="!isLoading && requests.length > 0">
          <div *ngFor="let request of requests" class="request-card" [class]="'status-' + request.status.toLowerCase()">
            <div class="request-header">
              <div class="request-date">
                <div class="date-day">{{ formatDate(request.startTime) }}</div>
                <div class="date-time">{{ formatTimeRange(request.startTime, request.endTime) }}</div>
              </div>
              <div class="request-status">
                <span class="status-badge" [class]="'status-' + request.status.toLowerCase()">
                  {{ request.status }}
                </span>
              </div>
            </div>

            <div class="request-content">
              <h3 class="request-title">{{ request.title }}</h3>
              <div class="request-details">
                <div class="detail-item">
                  <span class="detail-icon"><i class="pi pi-building"></i></span>
                  <span>{{ request.roomName }}</span>
                </div>
                <div class="detail-item" *ngIf="request.attendees.length > 0">
                  <span class="detail-icon"><i class="pi pi-users"></i></span>
                  <span>{{ request.attendees.length }} attendees</span>
                </div>
                <div class="detail-item" *ngIf="request.isEmergency">
                  <span class="detail-icon"><i class="pi pi-exclamation-triangle"></i></span>
                  <span>Emergency Request</span>
                </div>
                <div class="detail-item rejection-comment" *ngIf="request.status === 'Rejected' && getRejectionComment(request)">
                  <span class="detail-icon"><i class="pi pi-comment"></i></span>
                  <span>Rejection reason: {{ getRejectionComment(request) }}</span>
                </div>
                <div class="detail-item suggestion-comment" *ngIf="getSuggestedRoom(request)">
                  <span class="detail-icon"><i class="pi pi-lightbulb"></i></span>
                  <span>Manager suggested: {{ getSuggestedRoom(request) }}</span>
                </div>
              </div>
            </div>

            <div class="request-actions">
              <button class="action-btn view-btn" (click)="viewRequest(request)">
                <i class="pi pi-eye"></i> View
              </button>
              <button *ngIf="request.status === 'Pending'" class="action-btn cancel-btn" (click)="cancelRequest(request)">
                <i class="pi pi-times"></i> Cancel
              </button>
              <button *ngIf="getSuggestedRoom(request)" class="action-btn accept-btn" (click)="acceptSuggestion(request)">
                <i class="pi pi-check"></i> Accept Suggestion
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Request Details Modal -->
    <div *ngIf="selectedRequest" class="modal-overlay" (click)="closeModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{ selectedRequest.title }}</h2>
          <button class="close-btn" (click)="closeModal()">×</button>
        </div>
        
        <div class="modal-body">
          <div class="detail-section">
            <h4><i class="pi pi-calendar"></i> Schedule</h4>
            <p>{{ formatDate(selectedRequest.startTime) }}</p>
            <p>{{ formatTimeRange(selectedRequest.startTime, selectedRequest.endTime) }}</p>
          </div>
          
          <div class="detail-section">
            <h4><i class="pi pi-building"></i> Room</h4>
            <p>{{ selectedRequest.roomName }}</p>
          </div>
          
          <div class="detail-section" *ngIf="selectedRequest.attendees.length > 0">
            <h4><i class="pi pi-users"></i> Attendees ({{ selectedRequest.attendees.length }})</h4>
            <div class="attendees-list">
              <div *ngFor="let attendee of selectedRequest.attendees" class="attendee-item">
                <span class="attendee-name">{{ attendee.userName }}</span>
                <span class="attendee-role">{{ attendee.roleInMeeting }}</span>
              </div>
            </div>
          </div>
          
          <div class="detail-section">
            <h4><i class="pi pi-info-circle"></i> Details</h4>
            <p><strong>Status:</strong> {{ selectedRequest.status }}</p>
            <p><strong>Created:</strong> {{ formatDate(selectedRequest.createdAt) }}</p>
            <p *ngIf="selectedRequest.isEmergency"><strong>Emergency Request:</strong> Yes</p>
            <p *ngIf="selectedRequest.status === 'Rejected' && getRejectionComment(selectedRequest)">
              <strong>Rejection Reason:</strong> {{ getRejectionComment(selectedRequest) }}
            </p>
            <p *ngIf="getSuggestedRoom(selectedRequest)">
              <strong>Manager Suggestion:</strong> {{ getSuggestedRoom(selectedRequest) }}
            </p>
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

    .requests-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 1.5rem;
    }

    .request-card {
      background: var(--surface);
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: var(--shadow);
      border: 1px solid var(--border);
      border-left: 4px solid var(--warning);
      transition: all 0.2s ease;
    }

    .request-card:hover {
      box-shadow: var(--shadow-lg);
      transform: translateY(-2px);
    }

    .request-card.status-rejected {
      border-left-color: var(--error);
    }

    .request-card.status-approved {
      border-left-color: var(--success);
    }

    .request-header {
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

    .request-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 1rem;
    }

    .request-details {
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

    .request-actions {
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

    .cancel-btn:hover {
      border-color: var(--error);
      color: var(--error);
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

    .status-rejected {
      background: var(--error-bg, #fee2e2);
      color: var(--error-text, #991b1b);
    }

    .rejection-comment {
      color: var(--error, #ef4444);
      font-weight: 500;
      background: var(--error-bg, #fee2e2);
      padding: 0.5rem;
      border-radius: 6px;
      margin-top: 0.5rem;
    }

    .suggestion-comment {
      color: var(--warning, #f59e0b);
      font-weight: 500;
      background: var(--warning-bg, #fef3c7);
      padding: 0.5rem;
      border-radius: 6px;
      margin-top: 0.5rem;
    }

    .accept-btn {
      background: var(--success, #10b981);
      color: white;
      border-color: var(--success);
    }

    .accept-btn:hover {
      background: #059669;
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

    @media (max-width: 768px) {
      .container {
        padding: 1rem;
      }

      .request-actions {
        justify-content: center;
      }

      .requests-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class MyRequests implements OnInit {
  currentUser: User | null = null;
  requests: Booking[] = [];
  isLoading = true;
  selectedRequest: Booking | null = null;

  constructor(
    private bookingService: BookingService,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadRequests();
  }

  loadRequests(): void {
    if (this.currentUser) {
      this.bookingService.getBookingsByUser(this.currentUser.id).subscribe({
        next: (bookings) => {
          console.log('All requests received:', bookings);
          this.requests = bookings
            .filter(booking => 
              booking.status === 'Pending' || 
              booking.status === 'Rejected'
            )
            .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
          
          console.log('Filtered pending/rejected requests:', this.requests);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading requests:', error);
          this.requests = [];
          this.isLoading = false;
        }
      });
    } else {
      this.isLoading = false;
    }
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

  viewRequest(request: Booking): void {
    this.selectedRequest = request;
  }

  cancelRequest(request: Booking): void {
    if (confirm('Are you sure you want to cancel this request?')) {
      this.bookingService.deleteBooking(request.bookingId).subscribe({
        next: () => {
          this.toastService.success('Request Cancelled', 'Your request has been cancelled successfully');
          this.loadRequests();
        },
        error: (error) => {
          this.toastService.error('Error', 'Failed to cancel request');
          console.error('Error cancelling request:', error);
        }
      });
    }
  }

  closeModal(): void {
    this.selectedRequest = null;
  }

  getRejectionComment(request: Booking): string {
    return (request as any).rejectionComment || '';
  }

  getSuggestedRoom(request: Booking): string {
    return (request as any).suggestedRoomName || '';
  }

  acceptSuggestion(request: Booking): void {
    if (confirm('Accept the manager\'s room suggestion and proceed with booking?')) {
      // Here you would typically call an API to accept the suggestion
      // For now, we'll just show a success message
      this.toastService.success('Suggestion Accepted', 'Room suggestion accepted. Your booking will be updated.');
      this.loadRequests();
    }
  }
}