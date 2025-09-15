import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApprovalService, Approval } from '../../../services/approval.service';
import { MeetingRoomService, MeetingRoom } from '../../../services/meetingroom.service';
import { BookingService } from '../../../services/booking.service';
import { AuthService, User } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-approvals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="page-header-card">
        <div class="page-header">
          <h1><i class="pi pi-clipboard"></i> Meeting Approvals</h1>
          <p>Review and approve meeting requests from your team</p>
        </div>
      </div>



      <div class="filters">
        <div class="filter-buttons">
          <button class="filter-btn" [class.active]="activeFilter === 'all'" (click)="setFilter('all')">All</button>
          <button class="filter-btn" [class.active]="activeFilter === 'pending'" (click)="setFilter('pending')">Pending</button>
          <button class="filter-btn" [class.active]="activeFilter === 'approved'" (click)="setFilter('approved')">Approved</button>
          <button class="filter-btn" [class.active]="activeFilter === 'rejected'" (click)="setFilter('rejected')">Rejected</button>
        </div>
        
        <div class="search-box">
          <input 
            type="text" 
            placeholder="Search approvals..."
            [(ngModel)]="searchTerm"
            (input)="filterRequests()"
          >
          <span class="search-icon"><i class="pi pi-search"></i></span>
        </div>
      </div>

      <div class="approvals-container">
        <div *ngIf="filteredRequests.length === 0" class="empty-state">
          <div class="empty-icon"><i class="pi pi-inbox"></i></div>
          <h3>No {{ activeFilter }} requests</h3>
          <p>No meeting requests found for the selected filter.</p>
        </div>

        <div *ngIf="filteredRequests.length > 0" class="requests-grid">
          <div *ngFor="let request of filteredRequests" class="request-card">
            <div class="request-header">
              <h3>{{ request.bookingTitle }}</h3>
              <span class="status-badge" [ngClass]="getStatusClass(request.status)">{{ getStatusText(request.status) }}</span>
            </div>
            
            <div class="request-details">
              <div class="detail-row">
                <span class="icon"><i class="pi pi-user"></i></span>
                <span>Requested by: {{ request.requesterName }}</span>
              </div>
              <div class="detail-row">
                <span class="icon"><i class="pi pi-building"></i></span>
                <span>{{ request.roomName }}</span>
              </div>
              <div class="detail-row">
                <span class="icon"><i class="pi pi-calendar"></i></span>
                <span>{{ request.meetingStartTime | date:'fullDate' }}</span>
              </div>
              <div class="detail-row">
                <span class="icon"><i class="pi pi-clock"></i></span>
                <span>{{ request.meetingStartTime | date:'shortTime' }} - {{ request.meetingEndTime | date:'shortTime' }}</span>
              </div>
            </div>

            <div class="room-change-section" *ngIf="request.suggestedRoomId">
              <h4>Alternative Room Suggested:</h4>
              <div class="alternative-room">
                <span class="icon"><i class="pi pi-building"></i></span>
                <span>{{ request.suggestedRoomName }}</span>
              </div>
            </div>
            
            <div class="approval-actions">
              <button class="btn-round btn-primary" (click)="showAlternativeRooms(request)">
                <i class="pi pi-search"></i>
              </button>
              <button class="btn-round btn-success" (click)="approveRequest(request)">
                <i class="pi pi-check"></i>
              </button>
              <button class="btn-round btn-danger" (click)="rejectRequest(request)">
                <i class="pi pi-times"></i>
              </button>
            </div>
            
            <div class="request-footer">
              <small>Requested: {{ request.requestedAt | date:'short' }}</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Alternative Rooms Modal -->
      <div class="modal-overlay" *ngIf="showRoomsModal" (click)="closeRoomsModal()">
        <div class="modal-card" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Alternative Rooms for {{ selectedRequest?.bookingTitle }}</h3>
            <button class="close-btn" (click)="closeRoomsModal()">×</button>
          </div>
          <div class="modal-body">
            <div class="rooms-grid">
              <div *ngFor="let room of availableRooms" 
                   class="room-option"
                   [class.selected]="room.id === selectedAlternativeRoom?.id"
                   [class]="getRoomBorderClass(room)"
                   (click)="isRoomSelectable(room) ? selectAlternativeRoom(room) : null">
                <div class="room-status" 
                     [class.available]="roomAvailability[room.id] && (!currentRequestedRoom || room.id !== currentRequestedRoom.id)"
                     [class.unavailable]="!roomAvailability[room.id]"
                     [class.current]="currentRequestedRoom && room.id === currentRequestedRoom.id">
                  {{ currentRequestedRoom && room.id === currentRequestedRoom.id ? 'Current' : 
                     (roomAvailability[room.id] ? 'Available' : 'Unavailable') }}
                </div>
                <h4>{{ room.roomName }}</h4>
                <div class="room-info">
                  <span>Capacity: {{ room.capacity }}</span>
                  <span>{{ room.amenities }}</span>
                </div>
              </div>
            </div>
            <div class="modal-actions">
              <button class="btn-cancel" (click)="closeRoomsModal()">Cancel</button>
              <button class="btn-suggest" 
                      [disabled]="!selectedAlternativeRoom"
                      (click)="suggestAlternativeRoom()">
                Approve with Selected Room
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Rejection Comment Modal -->
      <div class="modal-overlay" *ngIf="showRejectModal" (click)="closeRejectModal()">
        <div class="modal-card" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Reject Meeting Request</h3>
            <button class="close-btn" (click)="closeRejectModal()">×</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Reason for rejection:</label>
              <textarea 
                [(ngModel)]="rejectionComment" 
                placeholder="Please provide a reason for rejecting this meeting request..."
                rows="4"
                class="comment-textarea"></textarea>
            </div>
            <div class="modal-actions">
              <button class="btn-cancel" (click)="closeRejectModal()">Cancel</button>
              <button class="btn-reject-confirm" (click)="confirmReject()">Reject Request</button>
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

    .requests-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
    }

    .request-card {
      background: var(--surface);
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      border: 1px solid var(--border);
    }

    .request-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .request-header h3 {
      margin: 0;
      color: var(--text);
      font-size: 1.1rem;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
    }

    .status-badge.pending {
      background: var(--warning-light, #fef3c7);
      color: var(--warning-dark, #92400e);
    }

    .status-badge.approved {
      background: var(--success-light, #d1fae5);
      color: var(--success-dark, #065f46);
    }

    .status-badge.rejected {
      background: var(--error-light, #fee2e2);
      color: var(--error-dark, #991b1b);
    }

    .request-details {
      margin-bottom: 1rem;
    }

    .detail-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
      color: var(--text-light);
    }

    .detail-row.emergency {
      color: var(--error, #ef4444);
      font-weight: 600;
    }

    .icon {
      font-size: 1rem;
      width: 1rem;
    }

    .room-change-section {
      background: var(--background);
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
    }

    .room-change-section h4 {
      margin: 0 0 0.5rem 0;
      color: var(--text);
      font-size: 0.9rem;
    }

    .alternative-room {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--primary);
      font-weight: 500;
    }

    .approval-actions {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .btn-round {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      transition: all 0.2s ease;
    }

    .btn-primary {
      background: var(--primary);
      color: white;
    }

    .btn-success {
      background: var(--success, #10b981);
      color: white;
    }

    .btn-danger {
      background: var(--error, #ef4444);
      color: white;
    }

    .btn-round:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }

    .request-footer {
      border-top: 1px solid var(--border);
      padding-top: 1rem;
      font-size: 0.8rem;
      color: var(--text-light);
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
      padding: 2rem;
      width: 90%;
      max-width: 800px;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      border: 1px solid var(--border);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
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

    .rooms-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .room-option {
      background: var(--background);
      border: 2px solid var(--border);
      border-radius: 8px;
      padding: 1rem;
      cursor: pointer;
      transition: all 0.2s;
      position: relative;
    }

    .room-option:hover {
      border-color: var(--primary);
    }

    .room-option.selected {
      border-color: var(--primary);
      background: var(--primary-light, rgba(59, 130, 246, 0.1));
    }

    .room-option.available-room {
      border-color: lightgreen;
      background: rgba(144, 238, 144, 0.3);
    }

    .room-option.unavailable-room {
      border-color: lightgray;
      background: rgba(211, 211, 211, 0.3);
      cursor: not-allowed;
      opacity: 0.7;
    }

    .room-option.current-room {
      border-color: tomato;
      background: rgba(255, 99, 71, 0.3);
    }

    .room-option.selected {
      border-color: #4f46e5;
      background: rgba(79, 70, 229, 0.2);
      box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.3);
    }

    .room-status {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      font-size: 0.75rem;
      font-weight: 500;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
    }

    .room-status.available {
      background: lightgreen;
      color: #006400;
    }

    .room-status.unavailable {
      background: lightgray;
      color: #555555;
    }

    .room-status.current {
      background: tomato;
      color: #8b0000;
    }

    .room-option h4 {
      margin: 0 0 0.5rem 0;
      color: var(--text);
    }

    .room-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      font-size: 0.8rem;
      color: var(--text-light);
    }

    .modal-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    }

    .btn-cancel, .btn-suggest {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
    }

    .btn-cancel {
      background: var(--text-light);
      color: white;
    }

    .btn-suggest {
      background: var(--primary);
      color: white;
    }

    .btn-suggest:disabled {
      background: var(--text-light);
      cursor: not-allowed;
    }

    .comment-textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid var(--border);
      border-radius: 6px;
      resize: vertical;
      font-family: inherit;
      background: var(--background);
      color: var(--text);
    }

    .comment-textarea:focus {
      outline: none;
      border-color: var(--primary);
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: var(--text);
    }

    .btn-reject-confirm {
      background: var(--error);
      color: white;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
    }

    .btn-reject-confirm:hover {
      background: #dc2626;
    }

    @media (max-width: 768px) {
      .filters {
        flex-direction: column;
        align-items: stretch;
      }

      .search-box input {
        width: 100%;
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
export class Approvals implements OnInit {
  allRequests: Approval[] = [];
  filteredRequests: Approval[] = [];
  activeFilter: 'all' | 'pending' | 'approved' | 'rejected' = 'all';
  searchTerm = '';
  showRoomsModal = false;
  showRejectModal = false;
  selectedRequest: Approval | null = null;
  availableRooms: MeetingRoom[] = [];
  selectedAlternativeRoom: MeetingRoom | null = null;
  roomAvailability: { [key: number]: boolean } = {};
  currentRequestedRoom: MeetingRoom | null = null;
  currentUser: User | null = null;
  rejectionComment = '';

  constructor(
    private approvalService: ApprovalService,
    private meetingRoomService: MeetingRoomService,
    private bookingService: BookingService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadAllRequests();
  }

  loadAllRequests(): void {
    if (this.currentUser) {
      this.approvalService.getAllApprovals(this.currentUser.id).subscribe({
        next: (requests) => {
          this.allRequests = requests;
          this.filterRequests();
        },
        error: (error) => {
          console.error('Error loading requests:', error);
          this.toastService.error('Error', 'Failed to load approval requests');
        }
      });
    }
  }

  setFilter(filter: 'all' | 'pending' | 'approved' | 'rejected'): void {
    this.activeFilter = filter;
    this.filterRequests();
  }

  filterRequests(): void {
    let filtered = [...this.allRequests];
    
    // Apply status filter
    if (this.activeFilter === 'pending') {
      filtered = filtered.filter(r => (r.status as any) === 0 || r.status === 'Pending');
    } else if (this.activeFilter === 'approved') {
      filtered = filtered.filter(r => (r.status as any) === 1 || r.status === 'Approved');
    } else if (this.activeFilter === 'rejected') {
      filtered = filtered.filter(r => (r.status as any) === 2 || r.status === 'Rejected');
    }
    
    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(request =>
        request.bookingTitle.toLowerCase().includes(term) ||
        request.roomName.toLowerCase().includes(term) ||
        request.requesterName.toLowerCase().includes(term)
      );
    }
    
    this.filteredRequests = filtered;
  }



  showAlternativeRooms(request: Approval): void {
    this.selectedRequest = request;
    this.showRoomsModal = true;
    this.loadAvailableRooms();
  }

  loadAvailableRooms(): void {
    if (!this.selectedRequest) return;
    
    this.meetingRoomService.getAllRooms().subscribe({
      next: (rooms) => {
        this.availableRooms = rooms;
        this.currentRequestedRoom = rooms.find(r => r.roomName === this.selectedRequest?.roomName) || null;
        this.checkRoomAvailability();
      },
      error: (error) => {
        console.error('Error loading rooms:', error);
      }
    });
  }

  checkRoomAvailability(): void {
    if (!this.selectedRequest) return;
    
    this.availableRooms.forEach(room => {
      this.bookingService.checkRoomAvailability(
        this.selectedRequest!.meetingStartTime,
        this.selectedRequest!.meetingEndTime,
        room.id
      ).subscribe({
        next: (result) => {
          this.roomAvailability[room.id] = result.isAvailable;
        },
        error: () => {
          this.roomAvailability[room.id] = false;
        }
      });
    });
  }

  getRoomBorderClass(room: MeetingRoom): string {
    if (this.currentRequestedRoom && room.id === this.currentRequestedRoom.id) {
      return 'current-room';
    }
    return this.roomAvailability[room.id] ? 'available-room' : 'unavailable-room';
  }

  isRoomSelectable(room: MeetingRoom): boolean {
    return this.roomAvailability[room.id] && 
           (!this.currentRequestedRoom || room.id !== this.currentRequestedRoom.id);
  }

  selectAlternativeRoom(room: MeetingRoom): void {
    this.selectedAlternativeRoom = room;
  }

  suggestAlternativeRoom(): void {
    if (this.selectedRequest && this.selectedAlternativeRoom) {
      // First approve the meeting
      this.approvalService.processApproval(this.selectedRequest.approvalId, {
        status: 1,
        comments: 'Meeting approved by manager'
      }).subscribe({
        next: () => {
          // Then suggest the alternative room with the selected room ID
          this.approvalService.suggestAlternativeRoom(
            this.selectedRequest!.approvalId,
            this.selectedAlternativeRoom!.id,
            `Room changed to ${this.selectedAlternativeRoom!.roomName}`
          ).subscribe({
            next: () => {
              this.toastService.success('Approved with Room Change', 
                `Meeting approved and room changed to ${this.selectedAlternativeRoom?.roomName}`);
              this.closeRoomsModal();
              this.loadAllRequests();
            },
            error: (error) => {
              console.error('Room suggestion error:', error);
              this.toastService.error('Error', 'Meeting approved but failed to change room');
            }
          });
        },
        error: (error) => {
          console.error('Approval error:', error);
          this.toastService.error('Error', 'Failed to approve request');
        }
      });
    }
  }

  closeRoomsModal(): void {
    this.showRoomsModal = false;
    this.selectedRequest = null;
    this.selectedAlternativeRoom = null;
  }

  approveRequest(request: Approval): void {
    this.approvalService.processApproval(request.approvalId, {
      status: 1,
      comments: 'Meeting approved by manager'
    }).subscribe({
      next: () => {
        this.toastService.success('Request Approved', `Meeting "${request.bookingTitle}" has been approved and booked`);
        this.loadAllRequests();
      },
      error: (error) => {
        console.error('Approval error:', error);
        this.toastService.error('Error', 'Failed to approve request');
      }
    });
  }

  rejectRequest(request: Approval): void {
    this.selectedRequest = request;
    this.showRejectModal = true;
    this.rejectionComment = '';
  }

  closeRejectModal(): void {
    this.showRejectModal = false;
    this.selectedRequest = null;
    this.rejectionComment = '';
  }

  confirmReject(): void {
    if (this.selectedRequest && this.rejectionComment.trim()) {
      this.approvalService.processApproval(this.selectedRequest.approvalId, {
        status: 2,
        comments: this.rejectionComment
      }).subscribe({
        next: () => {
          this.toastService.info('Request Rejected', `Meeting "${this.selectedRequest?.bookingTitle}" has been rejected`);
          this.closeRejectModal();
          this.loadAllRequests();
        },
        error: (error) => {
          console.error('Rejection error:', error);
          this.toastService.error('Error', 'Failed to reject request');
        }
      });
    } else {
      this.toastService.error('Error', 'Please provide a rejection reason');
    }
  }

  getStatusText(status: any): string {
    if (status === 0 || status === 'Pending') return 'Pending';
    if (status === 1 || status === 'Approved') return 'Approved';
    if (status === 2 || status === 'Rejected') return 'Rejected';
    return status;
  }

  getStatusClass(status: any): string {
    if (status === 0 || status === 'Pending') return 'pending';
    if (status === 1 || status === 'Approved') return 'approved';
    if (status === 2 || status === 'Rejected') return 'rejected';
    return 'pending';
  }
}