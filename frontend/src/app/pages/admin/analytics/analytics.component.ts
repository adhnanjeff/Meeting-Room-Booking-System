import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnalyticsService, UtilizationReport } from '../../../services/analytics.service';
import { LoaderService } from '../../../services/loader.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="page-header">
        <h1><i class="pi pi-chart-bar"></i> Room Utilization Analytics</h1>
        <p>Monitor meeting room usage patterns and optimize space allocation</p>
      </div>

      <div class="controls">
        <div class="period-selector">
          <label>Time Period:</label>
          <select [(ngModel)]="selectedPeriod" (change)="loadAnalytics()" class="form-select">
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        
        <div class="export-buttons">
          <button class="btn-export csv" (click)="exportReport('csv')">
            <i class="pi pi-file"></i> Export CSV
          </button>
          <button class="btn-export pdf" (click)="exportReport('pdf')">
            <i class="pi pi-file-pdf"></i> Export PDF
          </button>
        </div>
      </div>

      <div class="analytics-grid" *ngIf="report">
        <!-- Summary Cards -->
        <div class="summary-cards">
          <div class="summary-card total">
            <div class="card-icon"><i class="pi pi-calendar"></i></div>
            <div class="card-content">
              <div class="card-number">{{ report.totalMeetings }}</div>
              <div class="card-label">Total Meetings</div>
            </div>
          </div>
          
          <div class="summary-card duration">
            <div class="card-icon"><i class="pi pi-clock"></i></div>
            <div class="card-content">
              <div class="card-number">{{ report.avgMeetingDuration }}m</div>
              <div class="card-label">Avg Duration</div>
            </div>
          </div>
          
          <div class="summary-card popular">
            <div class="card-icon"><i class="pi pi-star"></i></div>
            <div class="card-content">
              <div class="card-number">{{ report.mostBookedRoom }}</div>
              <div class="card-label">Most Popular</div>
            </div>
          </div>
          
          <div class="summary-card underused">
            <div class="card-icon"><i class="pi pi-exclamation-triangle"></i></div>
            <div class="card-content">
              <div class="card-number">{{ report.leastBookedRoom }}</div>
              <div class="card-label">Underutilized</div>
            </div>
          </div>
        </div>

        <!-- Room Utilization Table -->
        <div class="chart-section">
          <h3>Room Utilization Overview</h3>
          <div class="utilization-table">
            <table>
              <thead>
                <tr>
                  <th>Room Name</th>
                  <th>Total Bookings</th>
                  <th>Utilization Rate</th>
                  <th>Avg Duration</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let room of report.roomUtilization" [class]="getUtilizationClass(room.utilizationRate)">
                  <td class="room-name">{{ room.roomName }}</td>
                  <td class="bookings">{{ room.totalBookings }}</td>
                  <td class="utilization">
                    <div class="utilization-bar">
                      <div class="utilization-fill" [style.width.%]="room.utilizationRate"></div>
                      <span class="utilization-text">{{ room.utilizationRate }}%</span>
                    </div>
                  </td>
                  <td class="duration">{{ room.avgDuration }}m</td>
                  <td class="status">
                    <span class="status-badge" [class]="getStatusClass(room.utilizationRate)">
                      {{ getStatusText(room.utilizationRate) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Booking Trends Chart -->
        <div class="chart-section">
          <h3>Booking Trends</h3>
          <div class="chart-container">
            <div class="bar-chart">
              <div *ngFor="let stat of getCurrentStats()" class="bar-item">
                <div class="bar" [style.height.%]="getBarHeight(stat.count)"></div>
                <div class="bar-label">{{ getBarLabel(stat) }}</div>
                <div class="bar-value">{{ stat.count }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Peak Hours Heatmap -->
        <div class="chart-section">
          <h3>Peak Booking Hours</h3>
          <div class="heatmap-container">
            <div class="heatmap">
              <div *ngFor="let hour of report.peakHours" class="hour-cell" 
                   [class]="getHeatmapClass(hour.bookingCount)"
                   [title]="hour.hour + ':00 - ' + hour.bookingCount + ' bookings'">
                <div class="hour-label">{{ formatHour(hour.hour) }}</div>
                <div class="hour-count">{{ hour.bookingCount }}</div>
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
      max-width: 1400px;
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

    .controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding: 1.5rem;
      background: var(--surface);
      border-radius: 12px;
      border: 1px solid var(--border);
    }

    .period-selector label {
      margin-right: 0.5rem;
      font-weight: 500;
      color: var(--text);
    }

    .form-select {
      padding: 0.5rem 1rem;
      border: 1px solid var(--border);
      border-radius: 6px;
      background: var(--background);
      color: var(--text);
    }

    .export-buttons {
      display: flex;
      gap: 1rem;
    }

    .btn-export {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s;
    }

    .btn-export.csv {
      background: var(--error);
      color: white;
    }

    .btn-export.pdf {
      background: var(--success);
      color: white;
    }

    .btn-export:hover {
      transform: translateY(-1px);
    }

    .analytics-grid {
      display: grid;
      gap: 2rem;
    }

    .summary-cards {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
    }

    .summary-card {
      background: var(--surface);
      border-radius: 12px;
      padding: 1.5rem;
      border: 1px solid var(--border);
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .card-icon {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      color: white;
    }

    .summary-card.total .card-icon { background: var(--primary); }
    .summary-card.duration .card-icon { background: var(--info); }
    .summary-card.popular .card-icon { background: var(--success); }
    .summary-card.underused .card-icon { background: var(--warning); }

    .card-number {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text);
    }

    .card-label {
      font-size: 0.875rem;
      color: var(--text-light);
    }

    .chart-section {
      background: var(--surface);
      border-radius: 12px;
      padding: 2rem;
      border: 1px solid var(--border);
    }

    .chart-section h3 {
      margin-bottom: 1.5rem;
      color: var(--text);
    }

    .utilization-table table {
      width: 100%;
      border-collapse: collapse;
    }

    .utilization-table th {
      background: var(--background);
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      color: var(--text);
      border-bottom: 2px solid var(--border);
    }

    .utilization-table td {
      padding: 1rem;
      border-bottom: 1px solid var(--border);
    }

    .utilization-table tr:hover {
      background: var(--background);
    }

    .utilization-table tr.high { border-left: 4px solid var(--success); }
    .utilization-table tr.medium { border-left: 4px solid var(--warning); }
    .utilization-table tr.low { border-left: 4px solid var(--error); }

    .utilization-bar {
      position: relative;
      width: 100px;
      height: 20px;
      background: var(--border);
      border-radius: 10px;
      overflow: hidden;
    }

    .utilization-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--error), var(--warning), var(--success));
      transition: width 0.3s ease;
    }

    .utilization-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text);
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .status-badge.high { background: var(--success-light); color: var(--success-dark); }
    .status-badge.medium { background: var(--warning-light); color: var(--warning-dark); }
    .status-badge.low { background: var(--error-light); color: var(--error-dark); }

    .chart-container {
      height: 300px;
      display: flex;
      align-items: end;
      justify-content: center;
    }

    .bar-chart {
      display: flex;
      align-items: end;
      gap: 1rem;
      height: 250px;
      width: 100%;
      justify-content: space-around;
    }

    .bar-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
      max-width: 60px;
    }

    .bar {
      width: 100%;
      background: linear-gradient(180deg, var(--primary), var(--primary-dark));
      border-radius: 4px 4px 0 0;
      min-height: 10px;
      transition: all 0.3s ease;
    }

    .bar-label {
      margin-top: 0.5rem;
      font-size: 0.75rem;
      color: var(--text-light);
      text-align: center;
    }

    .bar-value {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text);
      margin-top: 0.25rem;
    }

    .heatmap-container {
      overflow-x: auto;
    }

    .heatmap {
      display: grid;
      grid-template-columns: repeat(24, 1fr);
      gap: 2px;
      min-width: 800px;
    }

    .hour-cell {
      aspect-ratio: 1;
      border-radius: 4px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }

    .hour-cell.low { background: rgba(59, 130, 246, 0.2); }
    .hour-cell.medium { background: rgba(59, 130, 246, 0.5); }
    .hour-cell.high { background: rgba(59, 130, 246, 0.8); color: white; }

    .hour-label {
      font-size: 0.7rem;
      font-weight: 500;
    }

    .hour-count {
      font-size: 0.8rem;
      font-weight: 600;
    }

    @media (max-width: 1200px) {
      .summary-cards {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 768px) {
      .container {
        padding: 1rem;
      }
      
      .controls {
        flex-direction: column;
        gap: 1rem;
      }
      
      .summary-cards {
        grid-template-columns: 1fr;
      }
      
      .export-buttons {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class AnalyticsComponent implements OnInit {
  report: UtilizationReport | null = null;
  selectedPeriod: 'daily' | 'weekly' | 'monthly' = 'monthly';

  constructor(
    private analyticsService: AnalyticsService,
    private loaderService: LoaderService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    this.loaderService.show('Loading analytics...');
    this.analyticsService.getUtilizationReport(this.selectedPeriod).subscribe({
      next: (report) => {
        this.report = report;
        this.loaderService.hide();
      },
      error: (error) => {
        console.error('Error loading analytics:', error);
        this.toastService.error('Error', 'Failed to load analytics data');
        this.loaderService.hide();
      }
    });
  }

  exportReport(format: 'csv' | 'pdf'): void {
    this.analyticsService.exportReport(format, this.selectedPeriod).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `room-utilization-${this.selectedPeriod}.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.toastService.success('Export Complete', `Report exported as ${format.toUpperCase()}`);
      },
      error: (error) => {
        console.error('Export error:', error);
        this.toastService.error('Export Failed', 'Failed to export report');
      }
    });
  }

  getUtilizationClass(rate: number): string {
    if (rate >= 70) return 'high';
    if (rate >= 40) return 'medium';
    return 'low';
  }

  getStatusClass(rate: number): string {
    if (rate >= 70) return 'high';
    if (rate >= 40) return 'medium';
    return 'low';
  }

  getStatusText(rate: number): string {
    if (rate >= 70) return 'Optimal';
    if (rate >= 40) return 'Moderate';
    return 'Low';
  }

  getCurrentStats(): { label: string; count: number }[] {
    if (!this.report) return [];
    switch (this.selectedPeriod) {
      case 'daily': 
        return this.report.bookingStats.daily.map(stat => ({
          label: new Date(stat.date).toLocaleDateString('en-US', { weekday: 'short' }),
          count: stat.count
        }));
      case 'weekly': 
        return this.report.bookingStats.weekly.map(stat => ({
          label: stat.week,
          count: stat.count
        }));
      case 'monthly': 
        return this.report.bookingStats.monthly.map(stat => ({
          label: stat.month,
          count: stat.count
        }));
      default: return [];
    }
  }

  getBarHeight(count: number): number {
    const stats = this.getCurrentStats();
    const max = Math.max(...stats.map(s => s.count));
    return (count / max) * 100;
  }

  getBarLabel(stat: { label: string; count: number }): string {
    return stat.label;
  }

  getHeatmapClass(count: number): string {
    if (count >= 10) return 'high';
    if (count >= 5) return 'medium';
    return 'low';
  }

  formatHour(hour: number): string {
    return hour.toString().padStart(2, '0') + ':00';
  }
}