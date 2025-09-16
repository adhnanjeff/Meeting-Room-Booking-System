import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { InvitationService, InvitationResponse } from '../../services/invitation.service';
import { BookingService } from '../../services/booking.service';
import { LoaderService } from '../../services/loader.service';

interface Invitation {
  attendeeId: number;
  bookingId: string;
  title: string;
  organizer: string;
  startTime: string;
  endTime: string;
  roomName: string;
  status: 'Pending' | 'Accepted' | 'Declined';
}


@Component({
  selector: 'app-invitations',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <div class="page-header-card">
        <div class="page-header">
          <h1><i class="pi pi-envelope"></i> Meeting Invitations</h1>
          <p>Respond to meeting invitations you've received</p>
        </div>
      </div>

      <div class="filters">
        <div class="filter-buttons">
          <button 
            class="filter-btn"
            [class.active]="activeFilter === 'all'"
            (click)="setFilter('all')"
          >
            All Invitations
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
            [class.active]="activeFilter === 'accepted'"
            (click)="setFilter('accepted')"
          >
            Accepted
          </button>
          <button 
            class="filter-btn"
            [class.active]="activeFilter === 'declined'"
            (click)="setFilter('declined')"
          >
            Declined
          </button>
        </div>
      </div>

      <div class="invitations-container">


        <div *ngIf="filteredInvitations.length === 0" class="empty-state">
          <div class="empty-icon">📭</div>
          <h3>No invitations found</h3>
          <p>You don't have any invitations matching the current filter.</p>
        </div>

        <div class="invitations-grid" *ngIf="filteredInvitations.length > 0">
          <div *ngFor="let invitation of filteredInvitations" class="invitation-card">
            <div class="invitation-header">
              <h3>{{ invitation.title }}</h3>
              <span class="status-badge" [class]="'status-' + invitation.status.toLowerCase()">
                {{ invitation.status }}
              </span>
            </div>
            
            <div class="invitation-details">
              <div class="detail-item">
                <span class="icon"><i class="pi pi-user"></i></span>
                <span>Organized by: {{ invitation.organizer }}</span>
              </div>
              <div class="detail-item">
                <span class="icon"><i class="pi pi-building"></i></span>
                <span>{{ invitation.roomName }}</span>
              </div>
              <div class="detail-item">
                <span class="icon"><i class="pi pi-calendar"></i></span>
                <span>{{ formatDate(invitation.startTime) }}</span>
              </div>
              <div class="detail-item">
                <span class="icon"><i class="pi pi-clock"></i></span>
                <span>{{ formatTimeRange(invitation.startTime, invitation.endTime) }}</span>
              </div>
            </div>

            <div class="invitation-actions" *ngIf="invitation.status === 'Pending'">
              <button class="btn-round btn-success" (click)="acceptInvitation(invitation)"><i class="pi pi-check"></i></button>
              <button class="btn-round btn-danger" (click)="declineInvitation(invitation)"><i class="pi pi-times"></i></button>
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
      margin-bottom: 2rem;
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

    .invitations-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 1.5rem;
    }

    @media (min-width: 1200px) {
      .invitations-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    @media (max-width: 1199px) and (min-width: 768px) {
      .invitations-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .invitation-card {
      background: var(--surface);
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: var(--shadow);
      border: 1px solid var(--border);
      border-left: 4px solid #f59e0b;
      transition: all 0.2s ease;
    }

    .invitation-card:hover {
      box-shadow: var(--shadow-lg);
      transform: translateY(-2px);
    }

    .invitation-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .invitation-header h3 {
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

    .status-accepted {
      background: var(--success-bg, #dcfce7);
      color: var(--success-text, #166534);
    }

    .status-declined {
      background: var(--error-bg, #fee2e2);
      color: var(--error-text, #991b1b);
    }

    .invitation-details {
      margin-bottom: 1.5rem;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
      color: var(--text-light);
    }

    .icon {
      font-size: 1rem;
      width: 1rem;
    }

    .invitation-actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn-accept, .btn-decline {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 500;
      flex: 1;
    }

    .btn-accept {
      background: var(--success, #10b981);
      color: white;
    }

    .btn-decline {
      background: var(--error, #ef4444);
      color: white;
    }

    .btn-accept:hover {
      background: #059669;
    }

    .btn-decline:hover {
      background: #dc2626;
    }

    @media (max-width: 768px) {
      .container {
        padding: 1rem;
      }

      .filter-buttons {
        flex-wrap: wrap;
      }

      .invitation-card {
        padding: 1rem;
        min-height: 140px;
      }

      .invitation-header {
        flex-direction: row;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 0.75rem;
      }

      .invitation-header h3 {
        font-size: 1.1rem;
        font-weight: 700;
        text-align: center;
        flex: 1;
        margin-right: 0.5rem;
      }

      .invitation-details {
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

      .invitation-actions {
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

      .btn-success {
        background: var(--success);
        color: white;
      }

      .btn-danger {
        background: var(--error);
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

      .status-accepted {
        background: #10b981;
        color: white;
      }

      .status-declined {
        background: #ef4444;
        color: white;
      }
    }
  `]
})
export class Invitations implements OnInit {
  currentUser: User | null = null;
  invitations: Invitation[] = [];
  filteredInvitations: Invitation[] = [];
  isLoading = true;
  activeFilter: 'all' | 'pending' | 'accepted' | 'declined' = 'all';

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private invitationService: InvitationService,
    private bookingService: BookingService,
    private loaderService: LoaderService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loaderService.show('Loading invitations...');
    this.loadFilteredInvitations();
  }

  loadInvitations(): void {
    if (this.currentUser) {
      this.invitationService.getUserInvitations(this.currentUser.id).subscribe({
        next: (invitations) => {
          this.processInvitations(invitations);
          this.loaderService.hide();
        },
        error: (error) => {
          console.error('Error loading invitations:', error);
          this.invitations = [];
          this.loaderService.hide();
        }
      });
    }
  }

  processInvitations(invitations: InvitationResponse[]): void {
    const bookingPromises = invitations.map(inv => 
      this.bookingService.getAllBookings().toPromise().then(bookings => {
        const booking = bookings?.find(b => b.bookingId === inv.bookingId);
        return {
          attendeeId: inv.attendeeId,
          bookingId: inv.bookingId,
          title: inv.bookingTitle,
          organizer: booking?.organizerName || 'Unknown',
          startTime: booking?.startTime || '',
          endTime: booking?.endTime || '',
          roomName: booking?.roomName || 'Unknown Room',
          status: inv.status === 0 ? 'Pending' : inv.status === 1 ? 'Accepted' : 'Declined'
        } as Invitation;
      })
    );

    Promise.all(bookingPromises).then(processedInvitations => {
      this.filteredInvitations = processedInvitations;
    });
  }

  setFilter(filter: 'all' | 'pending' | 'accepted' | 'declined'): void {
    this.activeFilter = filter;
    this.loadFilteredInvitations();
  }

  loadFilteredInvitations(): void {
    if (!this.currentUser) return;
    
    this.loaderService.show('Loading invitations...');
    
    if (this.activeFilter === 'all') {
      this.invitationService.getUserInvitations(this.currentUser.id).subscribe({
        next: (invitations) => {
          this.processInvitations(invitations);
          this.loaderService.hide();
        },
        error: (error) => {
          console.error('Error loading invitations:', error);
          this.invitations = [];
          this.filteredInvitations = [];
          this.loaderService.hide();
        }
      });
    } else {
      const statusMap = {
        'pending': 'Pending' as const,
        'accepted': 'Accepted' as const,
        'declined': 'Declined' as const
      };
      
      this.invitationService.getInvitationsByStatus(this.currentUser.id, statusMap[this.activeFilter]).subscribe({
        next: (invitations) => {
          this.processInvitations(invitations);
          this.loaderService.hide();
        },
        error: (error) => {
          console.error('Error loading filtered invitations:', error);
          this.invitations = [];
          this.filteredInvitations = [];
          this.loaderService.hide();
        }
      });
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

  acceptInvitation(invitation: Invitation): void {
    this.invitationService.acceptInvitation(invitation.attendeeId).subscribe({
      next: () => {
        this.toastService.success('Invitation Accepted', `You've accepted the invitation for "${invitation.title}"`);
        this.loadFilteredInvitations(); // Reload to get fresh data
      },
      error: (error) => {
        console.error('Error accepting invitation:', error);
        this.toastService.error('Error', 'Failed to accept invitation');
      }
    });
  }

  declineInvitation(invitation: Invitation): void {
    this.invitationService.declineInvitation(invitation.attendeeId).subscribe({
      next: () => {
        this.toastService.info('Invitation Declined', `You've declined the invitation for "${invitation.title}"`);
        this.loadFilteredInvitations(); // Reload to get fresh data
      },
      error: (error) => {
        console.error('Error declining invitation:', error);
        this.toastService.error('Error', 'Failed to decline invitation');
      }
    });
  }
}