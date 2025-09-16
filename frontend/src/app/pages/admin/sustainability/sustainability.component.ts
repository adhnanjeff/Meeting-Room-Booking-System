import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SustainabilityService, SustainabilityReport } from '../../../services/sustainability.service';
import { LoaderService } from '../../../services/loader.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-sustainability',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="page-header">
        <h1><i class="pi pi-globe"></i> Sustainability & Green Insights</h1>
        <p>Track environmental impact and promote eco-friendly meeting practices</p>
      </div>

      <div class="controls">
        <div class="export-buttons">
          <button class="btn-export csv" (click)="exportReport('csv')">
            <i class="pi pi-file"></i> Export CSV
          </button>
          <button class="btn-export pdf" (click)="exportReport('pdf')">
            <i class="pi pi-file-pdf"></i> Export PDF
          </button>
        </div>
      </div>

      <div class="sustainability-grid" *ngIf="report">
        <!-- Environmental Impact Cards -->
        <div class="impact-cards">
          <div class="impact-card energy">
            <div class="card-icon"><i class="pi pi-bolt"></i></div>
            <div class="card-content">
              <div class="card-number">{{ report.metrics.energySavedKwh }}</div>
              <div class="card-label">kWh Saved</div>
              <div class="card-subtitle">{{ report.metrics.hoursSaved }} hours recovered</div>
            </div>
          </div>
          
          <div class="impact-card co2">
            <div class="card-icon"><i class="pi pi-cloud"></i></div>
            <div class="card-content">
              <div class="card-number">{{ report.metrics.co2ReductionKg }}</div>
              <div class="card-label">kg CO₂ Reduced</div>
              <div class="card-subtitle">{{ report.metrics.treesEquivalent }} trees equivalent</div>
            </div>
          </div>
          
          <div class="impact-card score">
            <div class="card-icon"><i class="pi pi-star"></i></div>
            <div class="card-content">
              <div class="card-number">{{ report.metrics.overallGreenScore }}</div>
              <div class="card-label">Green Score</div>
              <div class="card-subtitle">{{ getScoreLevel(report.metrics.overallGreenScore) }}</div>
            </div>
          </div>
          
          <div class="impact-card efficiency">
            <div class="card-icon"><i class="pi pi-check-circle"></i></div>
            <div class="card-content">
              <div class="card-number">{{ report.metrics.autoReleasedRooms }}</div>
              <div class="card-label">Auto-Released</div>
              <div class="card-subtitle">{{ report.metrics.totalNoShows }} no-shows tracked</div>
            </div>
          </div>
        </div>

        <!-- Monthly Trends Chart -->
        <div class="chart-section">
          <h3>Monthly Environmental Impact</h3>
          <div class="trends-chart">
            <div class="chart-container">
              <div class="dual-bar-chart">
                <div *ngFor="let trend of report.monthlyTrends" class="trend-item">
                  <div class="trend-bars">
                    <div class="bar hours" [style.height.%]="getBarHeight(trend.hoursSaved, 'hours')" 
                         [title]="trend.hoursSaved + ' hours saved'"></div>
                    <div class="bar co2" [style.height.%]="getBarHeight(trend.co2Reduction, 'co2')" 
                         [title]="trend.co2Reduction + ' kg CO₂ reduced'"></div>
                  </div>
                  <div class="trend-label">{{ trend.month }}</div>
                  <div class="trend-values">
                    <span class="hours-value">{{ trend.hoursSaved }}h</span>
                    <span class="co2-value">{{ trend.co2Reduction }}kg</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="chart-legend">
              <div class="legend-item">
                <div class="legend-color hours"></div>
                <span>Hours Saved</span>
              </div>
              <div class="legend-item">
                <div class="legend-color co2"></div>
                <span>CO₂ Reduction (kg)</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Team Green Scores -->
        <div class="teams-section">
          <h3>Team Green Scores & Badges</h3>
          <div class="teams-grid">
            <div *ngFor="let team of report.teamScores" class="team-card" [class]="getTeamClass(team.greenScore)">
              <div class="team-header">
                <div class="team-info">
                  <h4>{{ team.teamName }}</h4>
                  <span class="department">{{ team.department }}</span>
                </div>
                <div class="green-score" [class]="getScoreClass(team.greenScore)">
                  {{ team.greenScore }}
                </div>
              </div>
              
              <div class="team-metrics">
                <div class="metric">
                  <span class="metric-label">No-Show Rate</span>
                  <div class="metric-bar">
                    <div class="metric-fill no-show" [style.width.%]="team.noShowRate"></div>
                    <span class="metric-value">{{ team.noShowRate }}%</span>
                  </div>
                </div>
                
                <div class="metric">
                  <span class="metric-label">Efficiency Rate</span>
                  <div class="metric-bar">
                    <div class="metric-fill efficiency" [style.width.%]="team.efficiencyRate"></div>
                    <span class="metric-value">{{ team.efficiencyRate }}%</span>
                  </div>
                </div>
              </div>
              
              <div class="team-badge" *ngIf="team.badge">
                <i class="pi pi-trophy"></i>
                <span>{{ team.badge }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Achievement Badges -->
        <div class="badges-section" *ngIf="report.badges.length > 0">
          <h3>Monthly Achievement Badges</h3>
          <div class="badges-grid">
            <div *ngFor="let badge of report.badges" class="badge-card">
              <div class="badge-icon">
                <i class="pi pi-trophy"></i>
              </div>
              <div class="badge-content">
                <div class="badge-title">{{ badge.badge }}</div>
                <div class="badge-team">{{ badge.teamName }}</div>
                <div class="badge-achievement">{{ badge.achievement }}</div>
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
      justify-content: flex-end;
      margin-bottom: 2rem;
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
      background: var(--success);
      color: white;
    }

    .btn-export.pdf {
      background: var(--error);
      color: white;
    }

    .sustainability-grid {
      display: grid;
      gap: 2rem;
    }

    .impact-cards {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
    }

    .impact-card {
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

    .impact-card.energy .card-icon { background: #f59e0b; }
    .impact-card.co2 .card-icon { background: #10b981; }
    .impact-card.score .card-icon { background: #8b5cf6; }
    .impact-card.efficiency .card-icon { background: #3b82f6; }

    .card-number {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text);
    }

    .card-label {
      font-size: 0.875rem;
      color: var(--text-light);
      margin-bottom: 0.25rem;
    }

    .card-subtitle {
      font-size: 0.75rem;
      color: var(--text-light);
    }

    .chart-section, .teams-section, .badges-section {
      background: var(--surface);
      border-radius: 12px;
      padding: 2rem;
      border: 1px solid var(--border);
    }

    .chart-section h3, .teams-section h3, .badges-section h3 {
      margin-bottom: 1.5rem;
      color: var(--text);
    }

    .dual-bar-chart {
      display: flex;
      align-items: end;
      gap: 1rem;
      height: 200px;
      justify-content: space-around;
    }

    .trend-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
    }

    .trend-bars {
      display: flex;
      gap: 4px;
      align-items: end;
      height: 150px;
    }

    .bar {
      width: 20px;
      border-radius: 4px 4px 0 0;
      min-height: 10px;
    }

    .bar.hours { background: #3b82f6; }
    .bar.co2 { background: #10b981; }

    .trend-label {
      margin-top: 0.5rem;
      font-size: 0.75rem;
      color: var(--text-light);
    }

    .trend-values {
      display: flex;
      gap: 0.5rem;
      font-size: 0.7rem;
      margin-top: 0.25rem;
    }

    .hours-value { color: #3b82f6; }
    .co2-value { color: #10b981; }

    .chart-legend {
      display: flex;
      justify-content: center;
      gap: 2rem;
      margin-top: 1rem;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
    }

    .legend-color {
      width: 16px;
      height: 16px;
      border-radius: 2px;
    }

    .legend-color.hours { background: #3b82f6; }
    .legend-color.co2 { background: #10b981; }

    .teams-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }

    .team-card {
      background: var(--background);
      border-radius: 8px;
      padding: 1.5rem;
      border-left: 4px solid var(--border);
    }

    .team-card.excellent { border-left-color: #10b981; }
    .team-card.good { border-left-color: #3b82f6; }
    .team-card.average { border-left-color: #f59e0b; }

    .team-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .team-info h4 {
      margin: 0;
      color: var(--text);
    }

    .department {
      font-size: 0.75rem;
      color: var(--text-light);
    }

    .green-score {
      font-size: 1.5rem;
      font-weight: 700;
      padding: 0.5rem;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .green-score.excellent { background: #10b981; }
    .green-score.good { background: #3b82f6; }
    .green-score.average { background: #f59e0b; }

    .team-metrics {
      display: grid;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .metric-label {
      font-size: 0.75rem;
      color: var(--text-light);
      margin-bottom: 0.25rem;
      display: block;
    }

    .metric-bar {
      position: relative;
      height: 20px;
      background: var(--border);
      border-radius: 10px;
      overflow: hidden;
    }

    .metric-fill {
      height: 100%;
      border-radius: 10px;
    }

    .metric-fill.no-show { background: #ef4444; }
    .metric-fill.efficiency { background: #10b981; }

    .metric-value {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text);
    }

    .team-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: linear-gradient(135deg, #fbbf24, #f59e0b);
      color: white;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      width: fit-content;
    }

    .badges-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
    }

    .badge-card {
      background: var(--background);
      border-radius: 8px;
      padding: 1.5rem;
      text-align: center;
      border: 1px solid var(--border);
    }

    .badge-icon {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #fbbf24, #f59e0b);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem;
      font-size: 1.5rem;
      color: white;
    }

    .badge-title {
      font-weight: 600;
      color: var(--text);
      margin-bottom: 0.5rem;
    }

    .badge-team {
      font-size: 0.875rem;
      color: var(--primary);
      margin-bottom: 0.5rem;
    }

    .badge-achievement {
      font-size: 0.75rem;
      color: var(--text-light);
    }

    @media (max-width: 1200px) {
      .impact-cards {
        grid-template-columns: repeat(2, 1fr);
      }
      
      .teams-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .container {
        padding: 1rem;
      }
      
      .impact-cards {
        grid-template-columns: 1fr;
      }
      
      .badges-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class SustainabilityComponent implements OnInit {
  report: SustainabilityReport | null = null;

  constructor(
    private sustainabilityService: SustainabilityService,
    private loaderService: LoaderService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadSustainabilityData();
  }

  loadSustainabilityData(): void {
    this.loaderService.show('Loading sustainability data...');
    this.sustainabilityService.getSustainabilityReport().subscribe({
      next: (report) => {
        this.report = report;
        this.loaderService.hide();
      },
      error: (error) => {
        console.error('Error loading sustainability data:', error);
        this.toastService.error('Error', 'Failed to load sustainability data');
        this.loaderService.hide();
      }
    });
  }

  exportReport(format: 'csv' | 'pdf'): void {
    this.sustainabilityService.exportSustainabilityReport(format).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sustainability-report.${format}`;
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

  getScoreLevel(score: number): string {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Average';
    return 'Needs Improvement';
  }

  getScoreClass(score: number): string {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'good';
    return 'average';
  }

  getTeamClass(score: number): string {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'good';
    return 'average';
  }

  getBarHeight(value: number, type: 'hours' | 'co2'): number {
    if (!this.report) return 0;
    const maxHours = Math.max(...this.report.monthlyTrends.map(t => t.hoursSaved));
    const maxCo2 = Math.max(...this.report.monthlyTrends.map(t => t.co2Reduction));
    const max = type === 'hours' ? maxHours : maxCo2;
    return (value / max) * 100;
  }
}