import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
      <div class="page-header">
        <h1>⚙️ Admin Dashboard</h1>
        <p>System overview and management</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <div class="stat-number">45</div>
            <div class="stat-label">Total Users</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">🏢</div>
          <div class="stat-content">
            <div class="stat-number">12</div>
            <div class="stat-label">Meeting Rooms</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">📅</div>
          <div class="stat-content">
            <div class="stat-number">128</div>
            <div class="stat-label">Total Bookings</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <div class="stat-number">85%</div>
            <div class="stat-label">Room Utilization</div>
          </div>
        </div>
      </div>

      <div class="admin-actions">
        <h3>🚀 Quick Actions</h3>
        <div class="action-grid">
          <a routerLink="../users" class="action-card">
            <div class="action-icon">👥</div>
            <div class="action-content">
              <h4>Manage Users</h4>
              <p>Add, edit, or remove users</p>
            </div>
          </a>
          
          <a routerLink="../rooms" class="action-card">
            <div class="action-icon">🏢</div>
            <div class="action-content">
              <h4>Manage Rooms</h4>
              <p>Configure meeting rooms</p>
            </div>
          </a>
          
          <a routerLink="../bookings" class="action-card">
            <div class="action-icon">📋</div>
            <div class="action-content">
              <h4>View All Bookings</h4>
              <p>Monitor system usage</p>
            </div>
          </a>
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
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
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

    @media (max-width: 768px) {
      .container {
        padding: 1rem;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .action-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AdminHome {}