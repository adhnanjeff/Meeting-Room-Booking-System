import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BookingService, BookingResponse } from '../../../services/booking.service';
import { UserService, UserInfo } from '../../../services/user.service';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
      <div class="page-header">
        <div class="header-content">
          <h1><i class="pi pi-chart-line"></i> Admin Dashboard</h1>
          <p>System overview and management</p>
        </div>
        <div class="header-actions">
          <button class="filter-btn"><i class="pi pi-filter"></i> Filters</button>
          <button class="theme-toggle"><i class="pi pi-moon"></i></button>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card rooms">
          <div class="stat-icon"><i class="pi pi-building"></i></div>
          <div class="stat-content">
            <div class="stat-number">12</div>
            <div class="stat-label">Meeting Rooms</div>
            <div class="stat-trend">+2 this month</div>
          </div>
        </div>
        
        <div class="stat-card users">
          <div class="stat-icon"><i class="pi pi-users"></i></div>
          <div class="stat-content">
            <div class="stat-number">{{ systemUsers.length || 45 }}</div>
            <div class="stat-label">Total Users</div>
            <div class="stat-trend">+8 this week</div>
          </div>
        </div>
        
        <div class="stat-card bookings">
          <div class="stat-icon"><i class="pi pi-calendar"></i></div>
          <div class="stat-content">
            <div class="stat-number">{{ recentBookings.length || 128 }}</div>
            <div class="stat-label">Total Bookings</div>
            <div class="stat-trend">+15% vs last month</div>
          </div>
        </div>
        
        <div class="stat-card approvals">
          <div class="stat-icon"><i class="pi pi-clock"></i></div>
          <div class="stat-content">
            <div class="stat-number">{{ getPendingCount() }}</div>
            <div class="stat-label">Pending Approvals</div>
            <div class="stat-trend urgent">Needs attention</div>
          </div>
        </div>
      </div>

      <div class="charts-section">
        <div class="chart-card">
          <div class="chart-header">
            <h3><i class="pi pi-chart-pie"></i> Booking Status</h3>
          </div>
          <div class="donut-chart">
            <div class="chart-placeholder">
              <div class="donut-center">
                <div class="center-value">{{ recentBookings.length }}</div>
                <div class="center-label">Total</div>
              </div>
            </div>
            <div class="chart-legend">
              <div class="legend-item pending">
                <div class="legend-color"></div>
                <span>Pending ({{ getStatusCount('Pending') }})</span>
              </div>
              <div class="legend-item approved">
                <div class="legend-color"></div>
                <span>Approved ({{ getStatusCount('Approved') }})</span>
              </div>
              <div class="legend-item rejected">
                <div class="legend-color"></div>
                <span>Rejected ({{ getStatusCount('Rejected') }})</span>
              </div>
            </div>
          </div>
        </div>

        <div class="chart-card">
          <div class="chart-header">
            <h3><i class="pi pi-chart-bar"></i> Room Usage</h3>
          </div>
          <div class="bar-chart">
            <div class="bar-item" *ngFor="let room of getRoomUsage()">
              <div class="bar-label">{{ room.name }}</div>
              <div class="bar-container">
                <div class="bar-fill" [style.width.%]="room.usage"></div>
                <span class="bar-value">{{ room.usage }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="admin-actions">
        <h3><i class="pi pi-flash"></i> Quick Actions</h3>
        <div class="action-grid">
          <a routerLink="../users" class="action-card">
            <div class="action-icon"><i class="pi pi-users"></i></div>
            <div class="action-content">
              <h4>Manage Users</h4>
              <p>Add, edit, or remove users</p>
            </div>
          </a>
          
          <a routerLink="../rooms" class="action-card">
            <div class="action-icon"><i class="pi pi-building"></i></div>
            <div class="action-content">
              <h4>Manage Rooms</h4>
              <p>Configure meeting rooms</p>
            </div>
          </a>
          
          <a routerLink="../bookings" class="action-card">
            <div class="action-icon"><i class="pi pi-calendar"></i></div>
            <div class="action-content">
              <h4>View All Bookings</h4>
              <p>Monitor system usage</p>
            </div>
          </a>
        </div>
      </div>

      <div class="data-tables">
        <div class="table-section">
          <h3><i class="pi pi-calendar"></i> Recent Activity</h3>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Room</th>
                  <th>Organizer</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let booking of recentBookings" class="table-row" [attr.data-booking-id]="booking.bookingId">
                  <td>{{ booking.title }}</td>
                  <td>{{ booking.roomName }}</td>
                  <td>{{ booking.organizerName }}</td>
                  <td>{{ formatDate(booking.startTime) }}</td>
                  <td><span class="status-badge" [class]="getStatusClass(booking.status)">{{ booking.status }}</span></td>
                  <div class="hover-details">
                    <div class="detail-header">{{ booking.title }}</div>
                    <div class="detail-item"><strong>Time:</strong> {{ formatDateTime(booking.startTime) }} - {{ formatTime(booking.endTime) }}</div>
                    <div class="detail-item"><strong>Room:</strong> {{ booking.roomName }}</div>
                    <div class="detail-item"><strong>Organizer:</strong> {{ booking.organizerName }}</div>
                    <div class="detail-item"><strong>Attendees:</strong> {{ (booking.attendees && booking.attendees.length) || 0 }}</div>
                    <div class="detail-item" *ngIf="booking.isEmergency"><strong>Emergency:</strong> Yes</div>
                    <div class="detail-item" *ngIf="booking.teamsJoinUrl"><strong>Teams:</strong> Available</div>
                  </div>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="table-section">
          <h3><i class="pi pi-users"></i> System Users</h3>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>ID</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let user of systemUsers" class="table-row" [attr.data-user-id]="user.id">
                  <td>{{ user.userName }}</td>
                  <td>{{ user.email }}</td>
                  <td>{{ user.department }}</td>
                  <td>#{{ user.id }}</td>
                  <div class="hover-details">
                    <div class="detail-header">{{ user.userName }}</div>
                    <div class="detail-item"><strong>Email:</strong> {{ user.email }}</div>
                    <div class="detail-item"><strong>Department:</strong> {{ user.department }}</div>
                    <div class="detail-item"><strong>User ID:</strong> #{{ user.id }}</div>
                    <div class="detail-item"><strong>Status:</strong> Active</div>
                  </div>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding: 1.5rem 2rem;
      background: linear-gradient(135deg, var(--surface) 0%, rgba(59, 130, 246, 0.05) 100%);
      border-radius: 16px;
      border: 1px solid var(--border);
    }

    .header-content h1 {
      font-size: 2.25rem;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .header-content p {
      color: var(--text-light);
      font-size: 1rem;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
    }

    .filter-btn, .theme-toggle {
      padding: 0.75rem 1.5rem;
      background: var(--background);
      border: 1px solid var(--border);
      border-radius: 10px;
      color: var(--text);
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 500;
    }

    .filter-btn:hover, .theme-toggle:hover {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
      transform: translateY(-1px);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .stat-card {
      background: var(--surface);
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      border: 1px solid var(--border);
      display: flex;
      align-items: center;
      gap: 1.5rem;
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
      background: linear-gradient(90deg, var(--primary), var(--secondary));
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    }

    .stat-card.rooms::before { background: linear-gradient(90deg, #3b82f6, #1d4ed8); }
    .stat-card.users::before { background: linear-gradient(90deg, #10b981, #059669); }
    .stat-card.bookings::before { background: linear-gradient(90deg, #f59e0b, #d97706); }
    .stat-card.approvals::before { background: linear-gradient(90deg, #ef4444, #dc2626); }

    .stat-icon {
      font-size: 1.5rem;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      color: white;
      padding: 1rem;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }

    .stat-card.rooms .stat-icon { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
    .stat-card.users .stat-icon { background: linear-gradient(135deg, #10b981, #059669); }
    .stat-card.bookings .stat-icon { background: linear-gradient(135deg, #f59e0b, #d97706); }
    .stat-card.approvals .stat-icon { background: linear-gradient(135deg, #ef4444, #dc2626); }

    .stat-number {
      font-size: 2.25rem;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 0.25rem;
    }

    .stat-label {
      font-size: 0.875rem;
      color: var(--text-light);
      font-weight: 500;
      margin-bottom: 0.5rem;
    }

    .stat-trend {
      font-size: 0.75rem;
      color: var(--success);
      font-weight: 600;
    }

    .stat-trend.urgent {
      color: var(--error);
    }

    .admin-actions h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 1.5rem;
    }

    .action-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .action-card {
      background: var(--surface);
      border-radius: 12px;
      padding: 2rem;
      box-shadow: var(--shadow);
      border: 1px solid var(--border);
      text-decoration: none;
      color: var(--text);
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .action-card:hover {
      box-shadow: var(--shadow-lg);
      transform: translateY(-2px);
      border-color: var(--error);
    }

    .action-icon {
      font-size: 2.5rem;
      background: var(--background);
      padding: 1rem;
      border-radius: 12px;
    }

    .action-content h4 {
      font-size: 1.125rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .action-content p {
      color: var(--text-light);
      font-size: 0.875rem;
    }

    .data-tables {
      margin-top: 3rem;
      display: grid;
      gap: 2rem;
    }

    .table-section h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 1rem;
    }

    .table-container {
      background: var(--surface);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: var(--shadow);
      border: 1px solid var(--border);
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
    }

    .data-table th {
      background: var(--background);
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      color: var(--text);
      border-bottom: 1px solid var(--border);
    }

    .data-table td {
      padding: 1rem;
      border-bottom: 1px solid var(--border);
      color: var(--text);
    }

    .table-row {
      position: relative;
      transition: all 0.2s ease;
      cursor: pointer;
    }

    .table-row:hover {
      background: rgba(64, 153, 255, 0.05);
    }

    .table-row:last-child td {
      border-bottom: none;
    }

    .hover-details {
      position: absolute;
      top: 100%;
      left: 1rem;
      right: 1rem;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 1rem;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      z-index: 10;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-10px);
      transition: all 0.2s ease;
    }

    .table-row:hover .hover-details {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .detail-header {
      font-weight: 600;
      color: var(--text);
      margin-bottom: 0.5rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--border);
    }

    .detail-item {
      margin-bottom: 0.25rem;
      font-size: 0.875rem;
      color: var(--text-light);
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-badge.pending {
      background: rgba(255, 193, 7, 0.2);
      color: #f59e0b;
    }

    .status-badge.approved,
    .status-badge.scheduled {
      background: rgba(34, 197, 94, 0.2);
      color: #22c55e;
    }

    .status-badge.rejected,
    .status-badge.cancelled {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
    }

    .status-badge.completed {
      background: rgba(107, 114, 128, 0.2);
      color: #6b7280;
    }

    .charts-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      margin-bottom: 3rem;
    }

    .chart-card {
      background: var(--surface);
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      border: 1px solid var(--border);
    }

    .chart-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .chart-header h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text);
      margin: 0;
    }

    .donut-chart {
      display: flex;
      align-items: center;
      gap: 2rem;
    }

    .chart-placeholder {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: conic-gradient(#fbbf24 0deg 120deg, #10b981 120deg 240deg, #ef4444 240deg 360deg);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .donut-center {
      width: 80px;
      height: 80px;
      background: var(--surface);
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .center-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text);
    }

    .center-label {
      font-size: 0.75rem;
      color: var(--text-light);
    }

    .chart-legend {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.875rem;
    }

    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 2px;
    }

    .legend-item.pending .legend-color { background: #fbbf24; }
    .legend-item.approved .legend-color { background: #10b981; }
    .legend-item.rejected .legend-color { background: #ef4444; }

    .bar-chart {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .bar-item {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .bar-label {
      min-width: 100px;
      font-size: 0.875rem;
      color: var(--text);
      font-weight: 500;
    }

    .bar-container {
      flex: 1;
      height: 24px;
      background: var(--background);
      border-radius: 12px;
      position: relative;
      overflow: hidden;
    }

    .bar-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--primary), var(--secondary));
      border-radius: 12px;
      transition: width 0.3s ease;
    }

    .bar-value {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text);
    }

    @media (max-width: 768px) {
      .container {
        padding: 1rem;
      }

      .page-header {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .charts-section {
        grid-template-columns: 1fr;
      }

      .action-grid {
        grid-template-columns: 1fr;
      }

      .data-table {
        font-size: 0.875rem;
      }

      .data-table th,
      .data-table td {
        padding: 0.75rem 0.5rem;
      }

      .hover-details {
        position: fixed;
        left: 1rem;
        right: 1rem;
        top: 50%;
        transform: translateY(-50%);
      }

      .table-row:hover .hover-details {
        transform: translateY(-50%);
      }
    }
  `]
})
export class AdminHome implements OnInit {
  recentBookings: BookingResponse[] = [];
  systemUsers: UserInfo[] = [];

  constructor(
    private bookingService: BookingService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadRecentBookings();
    this.loadSystemUsers();
  }

  loadRecentBookings(): void {
    this.bookingService.getAllBookings().subscribe({
      next: (bookings) => {
        this.recentBookings = bookings.slice(0, 10);
      },
      error: (error) => {
        console.error('Error loading bookings:', error);
      }
    });
  }

  loadSystemUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.systemUsers = users.slice(0, 10);
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }

  formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  getStatusClass(status: string): string {
    return status.toLowerCase().replace(' ', '-');
  }

  getPendingCount(): number {
    return this.recentBookings.filter(b => b.status === 'Pending').length;
  }

  getStatusCount(status: string): number {
    return this.recentBookings.filter(b => b.status === status).length;
  }

  getRoomUsage(): any[] {
    return [
      { name: 'Conference A', usage: 85 },
      { name: 'Meeting B', usage: 72 },
      { name: 'Board Room', usage: 94 },
      { name: 'Small Room', usage: 45 },
      { name: 'Training', usage: 68 }
    ];
  }
}