import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService, User } from '../../../services/auth.service';
import { ApprovalService } from '../../../services/approval.service';
import { ToastService } from '../../../services/toast.service';
import { UserService } from '../../../services/user.service';
import { BookingService } from '../../../services/booking.service';

interface ApprovalItem {
  id: string;
  meetingTitle: string;
  requesterName: string;
  meetingDate: string;
  startTime: string;
  endTime: string;
  requestedTime: string;
  isEmergency: boolean;
  suggestedRoom?: string;
  status: 'pending' | 'approved' | 'rejected' | 'room_suggested';
}

@Component({
  selector: 'app-manager-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
      <div class="page-header">
        <h1><i class="pi pi-user"></i> Welcome back, {{ currentUser?.userName }}!</h1>
        <p>Manage your team and approve meeting requests</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card urgent">
          <div class="stat-icon"><i class="pi pi-clock"></i></div>
          <div class="stat-content">
            <div class="stat-number">{{ pendingApprovals }}</div>
            <div class="stat-label">Pending Approvals</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon"><i class="pi pi-users"></i></div>
          <div class="stat-content">
            <div class="stat-number">{{ teamSize }}</div>
            <div class="stat-label">Team Members</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon"><i class="pi pi-calendar"></i></div>
          <div class="stat-content">
            <div class="stat-number">{{ teamMeetings }}</div>
            <div class="stat-label">Team Meetings Today</div>
          </div>
        </div>
      </div>

      <div class="content-grid">
        <div class="card">
          <div class="card-header">
            <h3><i class="pi pi-exclamation-triangle"></i> Urgent Approvals</h3>
            <a routerLink="../approvals" class="view-all">View All</a>
          </div>
          <div class="card-content">
            <div *ngIf="approvalItems.length === 0" class="empty-state">
              <div class="empty-icon"><i class="pi pi-check-circle"></i></div>
              <p>No pending approvals</p>
              <p class="empty-desc">All caught up! New requests will appear here.</p>
            </div>
            
            <div *ngIf="approvalItems.length > 0" class="approval-list">
              <div *ngFor="let approval of approvalItems.slice(0, 3)" class="approval-item" [class.emergency]="approval.isEmergency">
                <div class="approval-header">
                  <div class="approval-title">
                    <span *ngIf="approval.isEmergency" class="emergency-badge"><i class="pi pi-exclamation-triangle"></i> EMERGENCY</span>
                    {{ approval.meetingTitle }}
                  </div>
                  <div class="approval-time">{{ approval.requestedTime }}</div>
                </div>
                <div class="approval-details">
                  <div class="detail-row">
                    <span class="icon"><i class="pi pi-user"></i></span>
                    <span>{{ approval.requesterName }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="icon"><i class="pi pi-calendar"></i></span>
                    <span>{{ approval.meetingDate }} {{ approval.startTime }}-{{ approval.endTime }}</span>
                  </div>
                  <div class="detail-row" *ngIf="approval.suggestedRoom">
                    <span class="icon"><i class="pi pi-building"></i></span>
                    <span>Suggested: {{ approval.suggestedRoom }}</span>
                  </div>
                </div>
                <div class="approval-actions">
                  <button class="btn-round btn-success" (click)="approveRequest(approval)"><i class="pi pi-check"></i></button>
                  <button *ngIf="approval.isEmergency" class="btn-round btn-secondary" (click)="suggestAlternative(approval)"><i class="pi pi-bookmark"></i></button>
                  <button class="btn-round btn-danger" (click)="rejectRequest(approval)"><i class="pi pi-times"></i></button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3><i class="pi pi-calendar-check"></i> Today's Meeting Schedule</h3>
          </div>
          <div class="card-content">
            <div *ngIf="todaysMeetings.length === 0" class="empty-state">
              <div class="empty-icon"><i class="pi pi-calendar"></i></div>
              <p>No meetings today</p>
              <p class="empty-desc">Your schedule is clear for today.</p>
            </div>
            
            <div *ngIf="todaysMeetings.length > 0" class="meeting-list">
              <div *ngFor="let meeting of todaysMeetings" class="meeting-item">
                <div class="meeting-time">{{ formatTime(meeting.startTime) }}</div>
                <div class="meeting-details">
                  <div class="meeting-title">{{ meeting.title }}</div>
                  <div class="meeting-room">{{ meeting.roomName }}</div>
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
      border-radius: var(--border-radius);
      padding: var(--card-padding);
      box-shadow: var(--shadow);
      border: 1px solid var(--border);
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .stat-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
    }

    .stat-card:hover {
      box-shadow: var(--shadow-lg);
      transform: translateY(-4px);
    }

    .stat-card.urgent {
      border-color: var(--secondary);
      background: linear-gradient(135deg, rgba(46, 216, 182, 0.1) 0%, var(--surface) 100%);
    }

    .stat-card.urgent::before {
      background: linear-gradient(135deg, var(--secondary), #00d4aa);
    }

    .stat-card.urgent .stat-icon {
      background: linear-gradient(135deg, var(--secondary), #00d4aa);
    }

    .stat-icon {
      font-size: 2rem;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      color: white;
      padding: 0.75rem;
      border-radius: var(--border-radius-lg);
      box-shadow: 0 4px 8px rgba(64, 153, 255, 0.2);
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
      border-radius: var(--border-radius);
      box-shadow: var(--shadow);
      border: 1px solid var(--border);
      transition: all 0.3s ease;
      overflow: hidden;
    }

    .card-header {
      padding: var(--card-padding) var(--card-padding) 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: none;
      background: transparent;
    }

    .card-header h3 {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text);
    }

    .view-all {
      color: var(--secondary);
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .view-all:hover {
      text-decoration: underline;
    }

    .card-content {
      padding: 20px var(--card-padding);
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

    .empty-desc {
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }

    .approval-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .approval-item {
      border: 1px solid var(--border);
      border-radius: var(--border-radius);
      padding: 1rem;
      background: var(--background);
      transition: all 0.3s ease;
      position: relative;
    }

    .approval-item.emergency {
      border-color: var(--error);
      background: linear-gradient(135deg, var(--error-bg) 0%, var(--background) 100%);
      border-left: 4px solid var(--error);
    }

    .approval-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .approval-title {
      font-weight: 600;
      color: var(--text);
    }

    .emergency-badge {
      background: var(--error);
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      margin-right: 0.5rem;
    }

    .approval-time {
      font-size: 0.75rem;
      color: var(--text-light);
    }

    .approval-details {
      margin-bottom: 1rem;
    }

    .detail-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.25rem;
      font-size: 0.875rem;
      color: var(--text-light);
    }

    .approval-actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn-approve, .btn-suggest, .btn-reject {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-approve {
      background: var(--success, #10b981);
      color: white;
    }

    .btn-suggest {
      background: var(--warning, #f59e0b);
      color: white;
    }

    .btn-reject {
      background: var(--error, #ef4444);
      color: white;
    }

    .btn-approve:hover {
      background: #059669;
    }

    .btn-suggest:hover {
      background: #d97706;
    }

    .btn-reject:hover {
      background: #dc2626;
    }

    .meeting-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .meeting-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem;
      border-radius: var(--border-radius);
      border: 1px solid var(--border);
      background: var(--background);
      transition: all 0.3s ease;
      border-left: 4px solid var(--success);
    }

    .meeting-item:hover {
      background: var(--surface);
      transform: translateX(5px);
    }

    .meeting-time {
      font-weight: 600;
      color: var(--primary);
      font-size: 0.875rem;
      min-width: 60px;
    }

    .meeting-title {
      font-weight: 500;
      color: var(--text);
      margin-bottom: 0.25rem;
    }

    .meeting-room {
      font-size: 0.875rem;
      color: var(--text-light);
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
export class ManagerHome implements OnInit {
  currentUser: User | null = null;
  pendingApprovals = 0;
  teamSize = 0;
  teamMeetings = 0;
  approvalItems: ApprovalItem[] = [];
  todaysMeetings: any[] = [];

  constructor(
    private authService: AuthService,
    private approvalService: ApprovalService,
    private toastService: ToastService,
    private userService: UserService,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadPendingApprovals();
    this.loadTeamSize();
    this.loadTodaysMeetings();
  }

  loadPendingApprovals(): void {
    if (this.currentUser) {
      this.approvalService.getPendingApprovals(this.currentUser.id).subscribe({
        next: (approvals) => {
          this.approvalItems = approvals.map((approval: any) => ({
            id: approval.approvalId || approval.id || '',
            meetingTitle: approval.meetingTitle || approval.title || 'Meeting',
            requesterName: approval.requesterName || approval.requester || 'Unknown',
            meetingDate: approval.meetingDate || new Date().toISOString().split('T')[0],
            startTime: approval.startTime || '00:00',
            endTime: approval.endTime || '00:00',
            requestedTime: approval.requestedTime || 'Recently',
            isEmergency: approval.isEmergency || false,
            suggestedRoom: approval.suggestedRoom,
            status: approval.status || 'pending'
          }));
          this.pendingApprovals = this.approvalItems.length;
        },
        error: (error) => {
          console.error('Error loading approvals:', error);
          this.approvalItems = [];
          this.pendingApprovals = 0;
        }
      });
    }
  }

  approveRequest(approval: ApprovalItem): void {
    this.approvalService.processApproval(Number(approval.id), {
      status: 1,
      comments: 'Meeting approved by manager'
    }).subscribe({
      next: () => {
        this.loadPendingApprovals();
        this.toastService.success('Request Approved', `Meeting "${approval.meetingTitle}" approved successfully!`);
      },
      error: (error) => {
        console.error('Approval error:', error);
        this.toastService.error('Error', 'Failed to approve request');
      }
    });
  }

  suggestAlternative(approval: ApprovalItem): void {
    const suggestedRoom = prompt('Suggest an alternative room:', 'Conference Room B');
    if (suggestedRoom) {
      approval.suggestedRoom = suggestedRoom;
      approval.status = 'room_suggested';
      console.log('Room suggested:', approval);
      alert(`Alternative room "${suggestedRoom}" suggested to organizer.`);
    }
  }

  rejectRequest(approval: ApprovalItem): void {
    const reason = prompt('Reason for rejection (optional):');
    if (reason !== null) {
      this.approvalService.processApproval(Number(approval.id), {
        status: 2,
        comments: reason || 'Rejected by manager'
      }).subscribe({
        next: () => {
          this.loadPendingApprovals();
          this.toastService.info('Request Rejected', `Meeting "${approval.meetingTitle}" rejected.`);
        },
        error: (error) => {
          console.error('Rejection error:', error);
          this.toastService.error('Error', 'Failed to reject request');
        }
      });
    }
  }

  loadTeamSize(): void {
    if (this.currentUser) {
      this.userService.getTeamMembers(this.currentUser.id).subscribe({
        next: (teamMembers) => {
          this.teamSize = teamMembers.length;
        },
        error: (error) => {
          console.error('Error loading team members:', error);
          this.teamSize = 0;
        }
      });
    }
  }

  loadTodaysMeetings(): void {
    if (this.currentUser) {
      this.bookingService.getBookingsByUser(this.currentUser.id).subscribe({
        next: (bookings) => {
          const today = new Date().toDateString();
          const todaysBookings = bookings.filter(booking => 
            new Date(booking.startTime).toDateString() === today &&
            (booking.status === 'Approved' || booking.status === 'Scheduled')
          );
          this.teamMeetings = todaysBookings.length;
          this.todaysMeetings = todaysBookings.sort((a, b) => 
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
          );
        },
        error: (error) => {
          console.error('Error loading today\'s meetings:', error);
          this.teamMeetings = 0;
          this.todaysMeetings = [];
        }
      });
    }
  }

  formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }
}