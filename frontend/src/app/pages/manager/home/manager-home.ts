import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container">
      <div class="page-header">
        <h1><i class="pi pi-user"></i> Welcome back, <span class="username-gradient">{{ currentUser?.userName }}</span>!</h1>
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
        
        <div class="stat-card teams">
          <div class="stat-icon"><i class="pi pi-microsoft"></i></div>
          <div class="stat-content">
            <div class="stat-number">{{ teamMeetings }}</div>
            <div class="stat-label">Teams Meetings</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon"><i class="pi pi-users"></i></div>
          <div class="stat-content">
            <div class="stat-number">{{ teamSize }}</div>
            <div class="stat-label">Team Members</div>
          </div>
        </div>
        
        <div class="stat-card book-meeting" routerLink="../book-meeting">
          <div class="stat-icon"><i class="pi pi-plus"></i></div>
          <div class="stat-content">
            <div class="stat-label">Book Meeting</div>
            <div class="stat-sublabel">Schedule new meeting</div>
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
            
            <div *ngIf="approvalItems.length > 0" class="approvals-table">
              <table>
                <thead>
                  <tr>
                    <th>Meeting</th>
                    <th>Requester</th>
                    <th>Date & Time</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let approval of approvalItems.slice(0, 3)" 
                      class="approval-row"
                      [class.emergency]="approval.isEmergency"
                      (mouseenter)="showApprovalTooltip($event, approval)"
                      (mouseleave)="hideApprovalTooltip()">
                    <td class="meeting-title">
                      <span *ngIf="approval.isEmergency" class="emergency-badge"><i class="pi pi-exclamation-triangle"></i></span>
                      {{ approval.meetingTitle }}
                    </td>
                    <td class="requester-name">{{ approval.requesterName }}</td>
                    <td class="meeting-datetime">
                      {{ formatFullDateTime(approval.meetingDate, approval.startTime, approval.endTime) }}
                    </td>
                    <td class="approval-actions">
                      <button class="btn-round btn-success" (click)="approveRequest(approval)" title="Approve"><i class="pi pi-check"></i></button>
                      <button class="btn-round btn-danger" (click)="rejectRequest(approval)" title="Reject"><i class="pi pi-times"></i></button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Approval Details Tooltip -->
            <div class="approval-tooltip" 
                 *ngIf="hoveredApproval" 
                 [style.left.px]="approvalTooltipPosition.x" 
                 [style.top.px]="approvalTooltipPosition.y">
              <div class="tooltip-header">
                <h4>{{ hoveredApproval.meetingTitle }}</h4>
                <span *ngIf="hoveredApproval.isEmergency" class="emergency-indicator"><i class="pi pi-exclamation-triangle"></i> EMERGENCY</span>
              </div>
              <div class="tooltip-content">
                <div class="tooltip-row">
                  <span class="label">Requested by:</span>
                  <span>{{ hoveredApproval.requesterName }}</span>
                </div>
                <div class="tooltip-row">
                  <span class="label">Date:</span>
                  <span>{{ formatDate(hoveredApproval.meetingDate) }}</span>
                </div>
                <div class="tooltip-row">
                  <span class="label">Time:</span>
                  <span>{{ formatTimeRange(hoveredApproval.startTime, hoveredApproval.endTime) }}</span>
                </div>
                <div class="tooltip-row">
                  <span class="label">Status:</span>
                  <span class="status-text">{{ hoveredApproval.status | titlecase }}</span>
                </div>
                <div class="tooltip-row">
                  <span class="label">Requested:</span>
                  <span>{{ hoveredApproval.requestedTime }}</span>
                </div>
                <div class="tooltip-row" *ngIf="hoveredApproval.suggestedRoom">
                  <span class="label">Suggested Room:</span>
                  <span>{{ hoveredApproval.suggestedRoom }}</span>
                </div>
                <div class="tooltip-row" *ngIf="hoveredApproval.isEmergency">
                  <span class="label">Priority:</span>
                  <span class="emergency-text">Emergency Request</span>
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
            
            <div *ngIf="todaysMeetings.length > 0" class="meetings-table">
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
                  <tr *ngFor="let meeting of todaysMeetings" 
                      class="meeting-row"
                      (mouseenter)="showMeetingTooltip($event, meeting)"
                      (mouseleave)="hideMeetingTooltip()">
                    <td class="meeting-title">{{ meeting.title }}</td>
                    <td class="meeting-time">{{ formatTime(meeting.startTime) }} - {{ formatTime(meeting.endTime) }}</td>
                    <td class="meeting-location">{{ meeting.roomName }}</td>
                    <td><span class="status-badge" [ngClass]="getStatusClass(meeting.status)">{{ meeting.status }}</span></td>
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
              <span>{{ hoveredMeeting.organizerName || 'N/A' }}</span>
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
      </div>
    </div>

    <!-- Rejection Dialog Modal -->
    <div *ngIf="showRejectModal" class="modal-overlay" (click)="closeRejectModal()">
      <div class="rejection-modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3><i class="pi pi-times-circle"></i> Reject Meeting Request</h3>
        </div>
        <div class="modal-body">
          <div class="meeting-info" *ngIf="approvalToReject">
            <h4>{{ approvalToReject.meetingTitle }}</h4>
            <p><strong>Requested by:</strong> {{ approvalToReject.requesterName }}</p>
            <p><strong>Date & Time:</strong> {{ formatFullDateTime(approvalToReject.meetingDate, approvalToReject.startTime, approvalToReject.endTime) }}</p>
          </div>
          <div class="form-group">
            <label for="rejectionReason">Reason for rejection (optional):</label>
            <textarea 
              id="rejectionReason"
              [(ngModel)]="rejectionReason" 
              placeholder="Please provide a reason for rejecting this meeting request..."
              rows="4"
              class="form-textarea"
            ></textarea>
          </div>
          <p class="warning-text">The organizer will be notified of this rejection.</p>
        </div>
        <div class="modal-actions">
          <button class="btn-cancel" (click)="closeRejectModal()">Cancel</button>
          <button class="btn-reject" (click)="confirmReject()">Reject Request</button>
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
      grid-template-columns: repeat(4, 1fr);
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
      background: var(--primary);
    }

    .stat-card:hover {
      box-shadow: var(--shadow-lg);
      transform: translateY(-4px);
    }

    .stat-card.urgent::before {
      background: #f59e0b;
    }

    .stat-card.urgent .stat-icon {
      background: #f59e0b;
    }

    .stat-card.teams::before {
      background: #5865f2;
    }

    .stat-card.teams .stat-icon {
      background: #5865f2;
    }

    .stat-card.book-meeting {
      cursor: pointer;
    }

    .stat-card.book-meeting::before {
      background: var(--primary);
    }

    .stat-card.book-meeting .stat-icon {
      background: var(--primary);
    }

    .stat-sublabel {
      font-size: 0.75rem;
      color: var(--text-light);
      margin-top: 0.25rem;
    }

    .stat-icon {
      font-size: 2rem;
      background: var(--primary);
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

    .approvals-table {
      overflow-x: auto;
    }

    .approvals-table table {
      width: 100%;
      border-collapse: collapse;
    }

    .approvals-table th {
      background: var(--background);
      padding: 1rem 0.75rem;
      text-align: left;
      font-weight: 600;
      color: var(--text);
      border-bottom: 2px solid var(--border);
      font-size: 0.875rem;
    }

    .approvals-table th:last-child {
      text-align: center;
    }

    .approvals-table td {
      padding: 1rem 0.75rem;
      border-bottom: 1px solid var(--border);
      font-size: 0.875rem;
      vertical-align: middle;
    }

    .approval-row {
      transition: all 0.2s ease;
      cursor: pointer;
    }

    .approval-row:hover {
      background: var(--background);
    }

    .approval-row.emergency {
      border-left: 4px solid var(--error);
    }

    .meeting-title {
      font-weight: 600;
      color: var(--text);
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .emergency-badge {
      background: var(--error);
      color: white;
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
      font-size: 0.7rem;
      margin-right: 0.5rem;
      display: inline-flex;
      align-items: center;
      gap: 0.2rem;
    }

    .requester-name {
      color: var(--text-light);
    }

    .meeting-datetime {
      font-weight: 500;
      color: var(--text);
      white-space: nowrap;
      font-size: 0.85rem;
    }

    .approval-tooltip {
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

    .approval-tooltip .tooltip-header {
      margin-bottom: 0.75rem;
    }

    .approval-tooltip .tooltip-header h4 {
      margin: 0 0 0.25rem 0;
      color: var(--text);
      font-size: 1rem;
    }

    .emergency-indicator {
      background: var(--error);
      color: white;
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
      font-size: 0.7rem;
      display: inline-flex;
      align-items: center;
      gap: 0.2rem;
    }

    .approval-tooltip .tooltip-row {
      display: flex;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
    }

    .approval-tooltip .tooltip-row .label {
      font-weight: 600;
      color: var(--text);
      min-width: 80px;
      margin-right: 0.5rem;
    }

    .approval-tooltip .tooltip-row span:last-child {
      color: var(--text-light);
    }

    .status-text {
      font-weight: 500;
      color: var(--warning);
    }

    .emergency-text {
      font-weight: 600;
      color: var(--error);
    }

    .approval-actions {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
      align-items: center;
    }

    .btn-round {
      width: 36px;
      height: 36px;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin: 0 0.25rem;
      font-size: 1rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .btn-success {
      background: var(--success, #10b981);
      color: white;
    }

    .btn-success:hover {
      background: #059669;
      transform: scale(1.1);
    }

    .btn-danger {
      background: var(--error, #ef4444);
      color: white;
    }

    .btn-danger:hover {
      background: #dc2626;
      transform: scale(1.1);
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

    .username-gradient {
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
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

    .rejection-modal {
      background: var(--surface);
      border-radius: 12px;
      width: 90%;
      max-width: 500px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.2);
      border: 1px solid var(--border);
    }

    .rejection-modal .modal-header {
      padding: 1.5rem;
      border-bottom: 1px solid var(--border);
      background: #fef2f2;
      border-radius: 12px 12px 0 0;
    }

    .rejection-modal .modal-header h3 {
      margin: 0;
      color: #dc2626;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.1rem;
    }

    .rejection-modal .modal-body {
      padding: 1.5rem;
    }

    .meeting-info {
      background: var(--background);
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      border-left: 4px solid var(--primary);
    }

    .meeting-info h4 {
      margin: 0 0 0.5rem 0;
      color: var(--text);
      font-size: 1.1rem;
    }

    .meeting-info p {
      margin: 0.25rem 0;
      color: var(--text-light);
      font-size: 0.9rem;
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

    .form-textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: var(--background);
      color: var(--text);
      font-family: inherit;
      font-size: 0.9rem;
      resize: vertical;
      min-height: 100px;
    }

    .form-textarea:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
    }

    .warning-text {
      color: #dc2626;
      font-size: 0.9rem;
      font-weight: 500;
      margin-top: 1rem;
    }

    .modal-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      padding: 1rem 1.5rem 1.5rem;
      border-top: 1px solid var(--border);
    }

    .btn-cancel {
      padding: 0.75rem 1.5rem;
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--text);
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
    }

    .btn-cancel:hover {
      background: var(--background);
    }

    .btn-reject {
      padding: 0.75rem 1.5rem;
      border: none;
      background: #dc2626;
      color: white;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
    }

    .btn-reject:hover {
      background: #b91c1c;
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
  hoveredMeeting: any = null;
  tooltipPosition = { x: 0, y: 0 };
  hoveredApproval: ApprovalItem | null = null;
  approvalTooltipPosition = { x: 0, y: 0 };
  showRejectModal = false;
  approvalToReject: ApprovalItem | null = null;
  rejectionReason = '';

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
            meetingTitle: approval.meetingTitle || approval.title || approval.bookingTitle || 'Untitled Meeting',
            requesterName: approval.requesterName || approval.requester || approval.organizerName || 'Unknown',
            meetingDate: approval.meetingDate || approval.date || new Date().toISOString().split('T')[0],
            startTime: approval.startTime || '00:00',
            endTime: approval.endTime || '00:00',
            requestedTime: approval.requestedTime || approval.createdAt || 'Recently',
            isEmergency: approval.isEmergency || approval.priority === 'high' || false,
            suggestedRoom: approval.suggestedRoom || approval.roomName,
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
    this.approvalToReject = approval;
    this.rejectionReason = '';
    this.showRejectModal = true;
  }

  confirmReject(): void {
    if (this.approvalToReject) {
      this.approvalService.processApproval(Number(this.approvalToReject.id), {
        status: 2,
        comments: this.rejectionReason || 'Rejected by manager'
      }).subscribe({
        next: () => {
          this.loadPendingApprovals();
          this.toastService.info('Request Rejected', `Meeting "${this.approvalToReject!.meetingTitle}" rejected.`);
        },
        error: (error) => {
          console.error('Rejection error:', error);
          this.toastService.error('Error', 'Failed to reject request');
        }
      });
    }
    this.closeRejectModal();
  }

  closeRejectModal(): void {
    this.showRejectModal = false;
    this.approvalToReject = null;
    this.rejectionReason = '';
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

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'approved': return 'approved';
      case 'scheduled': return 'approved';
      case 'pending': return 'pending';
      case 'rejected': return 'rejected';
      default: return 'pending';
    }
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

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  formatTimeRange(startTime: string, endTime: string): string {
    // Handle both time-only format (HH:mm) and full datetime format
    let startDate, endDate;
    
    if (startTime.includes('T') || startTime.includes(' ')) {
      startDate = new Date(startTime);
      endDate = new Date(endTime);
    } else {
      startDate = new Date(`2000-01-01T${startTime}`);
      endDate = new Date(`2000-01-01T${endTime}`);
    }
    
    const start = startDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    const end = endDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    return `${start} – ${end}`;
  }

  formatFullDateTime(dateString: string, startTime: string, endTime: string): string {
    // Use startTime for date if it contains full datetime, otherwise use dateString
    let dateToUse = dateString;
    if (startTime.includes('T') || startTime.includes(' ')) {
      dateToUse = startTime;
    }
    
    const date = new Date(dateToUse).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    const timeRange = this.formatTimeRange(startTime, endTime);
    return `${date} | ${timeRange}`;
  }

  showApprovalTooltip(event: MouseEvent, approval: ApprovalItem): void {
    this.hoveredApproval = approval;
    this.approvalTooltipPosition = {
      x: event.clientX + 10,
      y: event.clientY - 10
    };
  }

  hideApprovalTooltip(): void {
    this.hoveredApproval = null;
  }
}