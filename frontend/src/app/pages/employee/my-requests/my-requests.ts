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
      <div class="page-header-card">
        <div class="page-header">
          <h1><i class="pi pi-clock"></i> My Requests</h1>
          <p>Track your pending and processed booking requests</p>
        </div>
      </div>

      <div class="filters">
        <div class="filter-buttons">
          <button 
            class="filter-btn"
            [class.active]="activeFilter === 'all'"
            (click)="setFilter('all')"
          >
            All Requests
          </button>
          <button 
            class="filter-btn"
            [class.active]="activeFilter === 'pending'"
            (click)="setFilter('pending')"
          >
            Pending
          </button>
          <button 
            class="filter-btn"
            [class.active]="activeFilter === 'approved'"
            (click)="setFilter('approved')"
          >
            Approved
          </button>
          <button 
            class="filter-btn"
            [class.active]="activeFilter === 'rejected'"
            (click)="setFilter('rejected')"
          >
            Rejected
          </button>
        </div>
        
        <div class="search-box">
          <input 
            type="text" 
            placeholder="Search requests..."
            [(ngModel)]="searchTerm"
            (input)="applyFilter()"
          >
          <span class="search-icon"><i class="pi pi-search"></i></span>
        </div>
      </div>

      <div class="requests-container">
        <div *ngIf="isLoading" class="loading">
          <div class="loading-spinner"></div>
          <p>Loading your requests...</p>
        </div>

        <div *ngIf="!isLoading && filteredRequests.length === 0" class="empty-state">
          <div class="empty-icon"><i class="pi pi-inbox"></i></div>
          <h3>No requests found</h3>
          <p>You don't have any requests matching the current filter.</p>
        </div>

        <div class="requests-grid" *ngIf="!isLoading && filteredRequests.length > 0">
          <div *ngFor="let request of filteredRequests" class="request-card" [class]="'status-' + request.status.toLowerCase()">
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
              <button class="btn-round btn-primary" (click)="viewRequest(request)"><i class="pi pi-search"></i></button>
              <button *ngIf="request.status === 'Pending'" class="btn-round btn-danger" (click)="cancelRequest(request)"><i class="pi pi-times"></i></button>
              <button *ngIf="getSuggestedRoom(request)" class="btn-round btn-success" (click)="acceptSuggestion(request)"><i class="pi pi-check"></i></button>
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
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
    }

    .request-card {
      background: #E6F3FF !important;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: var(--shadow);
      border: 1px solid #87CEEB;
      border-left: 4px solid #1E40AF;
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
      background: #E6F3FF;
      color: #1E40AF;
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

      .filters {
        flex-direction: column;
        align-items: stretch;
      }

      .search-box input {
        width: 100%;
      }

      .request-actions {
        justify-content: center;
      }

      .requests-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 1024px) {
      .requests-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class MyRequests implements OnInit {
  currentUser: User | null = null;
  requests: Booking[] = [];
  filteredRequests: Booking[] = [];
  isLoading = true;
  selectedRequest: Booking | null = null;
  activeFilter: 'all' | 'pending' | 'approved' | 'rejected' = 'all';
  searchTerm = '';

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
          // Only show bookings where current user is the organizer (their own requests)
          this.requests = bookings
            .filter(booking => booking.organizerId === this.currentUser!.id)
            .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
          
          this.applyFilter();
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

  setFilter(filter: 'all' | 'pending' | 'approved' | 'rejected'): void {
    this.activeFilter = filter;
    this.applyFilter();
  }

  applyFilter(): void {
    let filtered = [...this.requests];
    
    // Apply status filter
    if (this.activeFilter !== 'all') {
      const statusMap = {
        'pending': 'Pending',
        'approved': 'Approved',
        'rejected': 'Rejected'
      };
      filtered = filtered.filter(request => {
        const status = request.status;
        const targetStatus = statusMap[this.activeFilter as keyof typeof statusMap];
        return status === targetStatus || 
               (this.activeFilter === 'approved' && status === 'Scheduled') ||
               (this.activeFilter === 'rejected' && status === 'Cancelled');
      });
    }
    
    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(request =>
        request.title.toLowerCase().includes(term) ||
        request.roomName.toLowerCase().includes(term)
      );
    }
    
    this.filteredRequests = filtered;
  }
}