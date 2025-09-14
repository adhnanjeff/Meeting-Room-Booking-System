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
        <h1>👋 Welcome back, {{ currentUser?.userName }}!</h1>
        <p>Manage your team and approve meeting requests</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card urgent">
          <div class="stat-icon">⏳</div>
          <div class="stat-content">
            <div class="stat-number">{{ pendingApprovals }}</div>
            <div class="stat-label">Pending Approvals</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <div class="stat-number">{{ teamSize }}</div>
            <div class="stat-label">Team Members</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">📅</div>
          <div class="stat-content">
            <div class="stat-number">{{ teamMeetings }}</div>
            <div class="stat-label">Team Meetings Today</div>
          </div>
        </div>
      </div>

      <div class="content-grid">
        <div class="card">
          <div class="card-header">
            <h3>⏳ Urgent Approvals</h3>
            <a routerLink="../approvals" class="view-all">View All</a>
          </div>
          <div class="card-content">
            <div *ngIf="approvalItems.length === 0" class="empty-state">
              <div class="empty-icon">✅</div>
              <p>No pending approvals</p>
              <p class="empty-desc">All caught up! New requests will appear here.</p>
            </div>
            
            <div *ngIf="approvalItems.length > 0" class="approval-list">
              <div *ngFor="let approval of approvalItems.slice(0, 3)" class="approval-item" [class.emergency]="approval.isEmergency">
                <div class="approval-header">
                  <div class="approval-title">
                    <span *ngIf="approval.isEmergency" class="emergency-badge">🚨 EMERGENCY</span>
                    {{ approval.meetingTitle }}
                  </div>
                  <div class="approval-time">{{ approval.requestedTime }}</div>
                </div>
                <div class="approval-details">
                  <div class="detail-row">
                    <span class="icon">👤</span>
                    <span>{{ approval.requesterName }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="icon">📅</span>
                    <span>{{ approval.meetingDate }} {{ approval.startTime }}-{{ approval.endTime }}</span>
                  </div>
                  <div class="detail-row" *ngIf="approval.suggestedRoom">
                    <span class="icon">🏢</span>
                    <span>Suggested: {{ approval.suggestedRoom }}</span>
                  </div>
                </div>
                <div class="approval-actions">
                  <button class="btn-approve" (click)="approveRequest(approval)">Approve</button>
                  <button class="btn-suggest" *ngIf="approval.isEmergency" (click)="suggestAlternative(approval)">Suggest Room</button>
                  <button class="btn-reject" (click)="rejectRequest(approval)">Reject</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3>🚀 Manager Actions</h3>
          </div>
          <div class="card-content">
            <div class="action-buttons">
              <a routerLink="../approvals" class="action-btn primary">
                <span class="action-icon">✅</span>
                <div class="action-content">
                  <div class="action-title">Review Approvals</div>
                  <div class="action-desc">Process team requests</div>
                </div>
              </a>
              
              <a routerLink="../team" class="action-btn">
                <span class="action-icon">👥</span>
                <div class="action-content">
                  <div class="action-title">Manage Team</div>
                  <div class="action-desc">View team activities</div>
                </div>
              </a>
              
              <a routerLink="../book-room" class="action-btn">
                <span class="action-icon">📝</span>
                <div class="action-content">
                  <div class="action-title">Book Meeting</div>
                  <div class="action-desc">Schedule team meetings</div>
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

    .stat-card.urgent {
      border-color: var(--warning);
      background: linear-gradient(135deg, #fef3c7 0%, var(--surface) 100%);
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
      display: flex;
      justify-content: space-between;
      align-items: center;
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
      border-radius: 8px;
      padding: 1rem;
      background: var(--background);
    }

    .approval-item.emergency {
      border-color: var(--error);
      background: linear-gradient(135deg, #fef2f2 0%, var(--background) 100%);
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
      border-color: var(--secondary);
      background: var(--background);
    }

    .action-btn.primary {
      background: var(--secondary);
      color: white;
      border-color: var(--secondary);
    }

    .action-btn.primary:hover {
      background: #059669;
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
export class ManagerHome implements OnInit {
  currentUser: User | null = null;
  pendingApprovals = 0;
  teamSize = 0;
  teamMeetings = 0;
  approvalItems: ApprovalItem[] = [];

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
          this.teamMeetings = bookings.filter(booking => 
            new Date(booking.startTime).toDateString() === today &&
            (booking.status === 'Approved' || booking.status === 'Scheduled')
          ).length;
        },
        error: (error) => {
          console.error('Error loading today\'s meetings:', error);
          this.teamMeetings = 0;
        }
      });
    }
  }
}