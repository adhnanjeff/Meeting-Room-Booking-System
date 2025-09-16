import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, User } from '../../../services/admin.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <!-- Summary Stats -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon"><i class="pi pi-users"></i></div>
          <div class="stat-content">
            <div class="stat-value">{{ totalUsers }}</div>
            <div class="stat-label">Total Users</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><i class="pi pi-check-circle"></i></div>
          <div class="stat-content">
            <div class="stat-value">{{ activeUsers }}</div>
            <div class="stat-label">Active Users</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><i class="pi pi-plus-circle"></i></div>
          <div class="stat-content">
            <div class="stat-value">{{ newUsers }}</div>
            <div class="stat-label">New Users</div>
          </div>
        </div>
      </div>

      <div class="page-header-card">
        <div class="page-header">
          <h1><i class="pi pi-users"></i> User Management</h1>
          <p>Manage users and their roles</p>
        </div>
      </div>

      <!-- Controls -->
      <div class="controls">
        <div class="search-filter-group">
          <div class="search-box">
            <input 
              type="text" 
              placeholder="Search users..."
              [(ngModel)]="searchTerm"
              (input)="onSearchInput()"
            >
            <span class="search-icon"><i class="pi pi-search"></i></span>
          </div>
          <select [(ngModel)]="roleFilter" (change)="filterUsers()" class="filter-select">
            <option value="">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Manager">Manager</option>
            <option value="Employee">Employee</option>
          </select>
        </div>
        <div class="action-buttons">
          <button class="btn-export" (click)="exportData('csv')" title="Export CSV"><i class="pi pi-file"></i> CSV</button>
          <button class="btn-export" (click)="exportData('excel')" title="Export Excel"><i class="pi pi-file-excel"></i> Excel</button>
          <button class="btn-add" (click)="addUser()" title="Add User"><i class="pi pi-plus"></i> Add User</button>
        </div>
      </div>

      <!-- Data Table -->
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th (click)="sort('userName')" class="sortable">
                Name <span class="sort-icon">{{ getSortIcon('userName') }}</span>
              </th>
              <th (click)="sort('email')" class="sortable">
                Email <span class="sort-icon">{{ getSortIcon('email') }}</span>
              </th>
              <th (click)="sort('roles')" class="sortable">
                Role <span class="sort-icon">{{ getSortIcon('roles') }}</span>
              </th>
              <th (click)="sort('department')" class="sortable">
                Department <span class="sort-icon">{{ getSortIcon('department') }}</span>
              </th>
              <th>User ID</th>
              <th class="actions-header">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of paginatedUsers" class="table-row">
              <td class="user-name" (click)="showUserProfile(user)">
                {{ user.userName }}
              </td>
              <td>{{ user.email }}</td>
              <td>
                <span class="role-badge" [class]="getRoleClass(user.userRole)">
                  {{ getDisplayRole(user.userRole) }}
                </span>
              </td>
              <td class="department">{{ user.department }}</td>
              <td class="user-id">#{{ user.id }}</td>
              <td class="actions">
                <button class="action-btn view" (click)="showUserDetails(user)" title="View Details"><i class="pi pi-eye"></i></button>
                <button class="action-btn edit" (click)="editUser(user)" title="Edit User"><i class="pi pi-pencil"></i></button>
                <button class="action-btn delete" (click)="deleteUser(user.id)" title="Delete User"><i class="pi pi-trash"></i></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="pagination">
        <div class="pagination-info">
          Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ Math.min(currentPage * pageSize, filteredUsers.length) }} of {{ filteredUsers.length }} users
        </div>
        <div class="pagination-controls">
          <button (click)="previousPage()" [disabled]="currentPage === 1" class="page-btn">‹</button>
          <span *ngFor="let page of getPageNumbers()" 
                (click)="goToPage(page)" 
                [class.active]="page === currentPage"
                class="page-number">{{ page }}</span>
          <button (click)="nextPage()" [disabled]="currentPage === totalPages" class="page-btn">›</button>
        </div>
      </div>

      <!-- User Profile Sidebar -->
      <div class="profile-sidebar" [class.open]="showProfileSidebar" (click)="closeProfileSidebar()">
        <div class="sidebar-content" (click)="$event.stopPropagation()">
          <div class="sidebar-header">
            <h3>User Profile</h3>
            <button class="close-btn" (click)="closeProfileSidebar()">×</button>
          </div>
          <div class="profile-info" *ngIf="selectedUser">
            <div class="profile-avatar">{{ selectedUser.userName.charAt(0).toUpperCase() }}</div>
            <h4>{{ selectedUser.userName }}</h4>
            <p>{{ selectedUser.email }}</p>
            <div class="profile-details">
              <div class="detail-row">
                <span class="label">Department:</span>
                <span class="value">{{ selectedUser.department }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Role:</span>
                <span class="value">{{ getDisplayRole(selectedUser.userRole) }}</span>
              </div>
              <div class="detail-row">
                <span class="label">User ID:</span>
                <span class="value">#{{ selectedUser.id }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Total Bookings:</span>
                <span class="value">{{ selectedUser.totalBookings || 0 }}</span>
              </div>
            </div>
            <div class="profile-actions">
              <button class="btn-primary" (click)="editUser(selectedUser)">Edit User</button>
              <button class="btn-secondary" (click)="viewUserBookings(selectedUser.id)">View Bookings</button>
            </div>
          </div>
        </div>
      </div>

      <!-- User Details Popup -->
      <div class="modal-overlay" *ngIf="showDetailsPopup" (click)="closeDetailsPopup()">
        <div class="details-popup" (click)="$event.stopPropagation()">
          <div class="popup-header">
            <h3>User Details</h3>
            <button class="close-btn" (click)="closeDetailsPopup()">×</button>
          </div>
          <div class="popup-content" *ngIf="selectedUser">
            <div class="user-info">
              <div class="user-avatar-large">{{ selectedUser.userName.charAt(0).toUpperCase() }}</div>
              <div class="user-basic">
                <h4>{{ selectedUser.userName }}</h4>
                <p>{{ selectedUser.email }}</p>
              </div>
            </div>
            <div class="details-grid">
              <div class="detail-item">
                <span class="detail-label">User ID</span>
                <span class="detail-value">#{{ selectedUser.id }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Role</span>
                <span class="detail-value">{{ getDisplayRole(selectedUser.userRole) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Department</span>
                <span class="detail-value">{{ selectedUser.department }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Total Bookings</span>
                <span class="detail-value">{{ selectedUser.totalBookings || 0 }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Edit Modal -->
      <div class="modal-overlay" *ngIf="showEditModal" (click)="closeModal()">
        <div class="modal-card" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Edit User</h3>
            <button class="close-btn" (click)="closeModal()">×</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Username</label>
              <input type="text" [(ngModel)]="editingUser.userName" class="form-input" readonly>
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" [(ngModel)]="editingUser.email" class="form-input" readonly>
            </div>
            <div class="form-group">
              <label>Department</label>
              <input type="text" [(ngModel)]="editingUser.department" class="form-input">
            </div>
            <div class="form-group">
              <label>Role</label>
              <select [(ngModel)]="selectedRole" class="form-input">
                <option value="Employee">Employee</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn-cancel" (click)="closeModal()">Cancel</button>
            <button class="btn-save" (click)="saveUser()">Save</button>
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

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: var(--surface);
      border-radius: 16px;
      padding: 1.5rem;
      color: var(--text);
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      transition: transform 0.2s ease;
      border-left: 12px solid #4f46e5;
      border: 1px solid var(--border);
    }

    .stat-card:hover {
      transform: translateY(-4px);
    }

    .stat-card:nth-child(2) {
      border-left-color: #ec4899;
    }

    .stat-card:nth-child(3) {
      border-left-color: #06b6d4;
    }

    .stat-icon {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      color: white;
    }

    .stat-card:nth-child(1) .stat-icon {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .stat-card:nth-child(2) .stat-icon {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    .stat-card:nth-child(3) .stat-icon {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 0.25rem;
      color: var(--text);
    }

    .stat-label {
      font-size: 0.9rem;
      color: var(--text-light);
    }

    .page-header-card {
      background: var(--surface);
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
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

    .controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .search-filter-group {
      display: flex;
      gap: 1rem;
      flex: 1;
    }

    .search-box {
      position: relative;
      flex: 1;
      max-width: 300px;
    }

    .search-box input {
      width: 100%;
      padding: 0.75rem 2.5rem 0.75rem 1rem;
      border: 1px solid var(--border);
      border-radius: 12px;
      background: var(--surface);
      color: var(--text);
      font-size: 1rem;
      transition: border-color 0.2s ease;
    }

    .search-box input:focus {
      outline: none;
      border-color: #667eea;
    }

    .search-icon {
      position: absolute;
      right: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-light);
    }

    .filter-select {
      padding: 0.75rem 1rem;
      border: 1px solid var(--border);
      border-radius: 12px;
      background: var(--surface);
      color: var(--text);
      font-size: 1rem;
      cursor: pointer;
    }

    .action-buttons {
      display: flex;
      gap: 0.75rem;
    }

    .btn-export {
      padding: 0.75rem 1rem;
      border: none;
      border-radius: 12px;
      color: white;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .btn-export:first-of-type {
      background: var(--error);
    }

    .btn-export:nth-of-type(2) {
      background: var(--success);
    }

    .btn-export:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }

    .btn-add {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 12px;
      background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
      color: white;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .btn-add:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(249, 115, 22, 0.4);
    }

    .table-container {
      background: var(--surface);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
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
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    .data-table th.sortable {
      cursor: pointer;
      user-select: none;
      transition: background-color 0.2s ease;
    }

    .data-table th.sortable:hover {
      background: var(--surface);
    }

    .sort-icon {
      margin-left: 0.5rem;
      font-size: 0.8rem;
      color: var(--text-light);
    }

    .data-table td {
      padding: 1rem;
      border-bottom: 1px solid var(--border);
      color: var(--text);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      vertical-align: middle;
      text-align: center;
    }

    .data-table th {
      vertical-align: middle;
      text-align: center;
    }

    .table-row {
      transition: background-color 0.2s ease;
    }

    .table-row:hover {
      background: var(--background);
    }

    .user-name {
      cursor: pointer;
      font-weight: 500;
      text-align: center;
      vertical-align: middle;
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .user-id {
      font-family: 'Monaco', 'Menlo', monospace;
      color: var(--text-light);
      font-size: 0.9rem;
    }

    .booking-count {
      font-weight: 600;
      color: #667eea;
    }

    .role-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-align: center;
      vertical-align: middle;
      text-transform: uppercase;
      color: white;
    }

    .role-badge.admin {
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
    }

    .role-badge.manager {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    }

    .role-badge.employee {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
    }

    .status-badge.active {
      background: #dcfce7;
      color: #166534;
    }

    .actions {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
      align-items: center;
    }

    .actions-header {
      text-align: center;
      vertical-align: middle;
    }

    .action-btn {
      width: 32px;
      height: 32px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      transition: all 0.2s ease;
    }

    .action-btn.view {
      background: #e0f2fe;
      color: #0277bd;
    }

    .action-btn.edit {
      background: #fff3e0;
      color: #f57c00;
    }

    .action-btn.delete {
      background: #ffebee;
      color: #d32f2f;
    }

    .action-btn:hover {
      transform: scale(1.1);
    }

    .pagination {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 2rem;
      padding: 1rem;
      background: var(--surface);
      border-radius: 12px;
      border: 1px solid var(--border);
    }

    .pagination-info {
      color: var(--text-light);
      font-size: 0.9rem;
    }

    .pagination-controls {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .page-btn, .page-number {
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: var(--surface);
      color: var(--text);
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.2s ease;
    }

    .page-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .page-number.active {
      background: #667eea;
      color: white;
      border-color: #667eea;
    }

    .page-number:hover:not(.active) {
      background: var(--background);
    }

    .profile-sidebar {
      position: fixed;
      top: 0;
      right: -400px;
      width: 400px;
      height: 100vh;
      background: rgba(0,0,0,0.5);
      z-index: 1000;
      transition: right 0.3s ease;
    }

    .profile-sidebar.open {
      right: 0;
    }

    .sidebar-content {
      background: var(--surface);
      height: 100%;
      padding: 2rem;
      box-shadow: -4px 0 20px rgba(0,0,0,0.1);
      overflow-y: auto;
    }

    .sidebar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--border);
    }

    .sidebar-header h3 {
      margin: 0;
      color: var(--text);
    }

    .profile-avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      font-weight: 600;
      margin: 0 auto 1rem;
    }

    .profile-info h4 {
      text-align: center;
      margin: 0 0 0.5rem;
      color: var(--text);
    }

    .profile-info p {
      text-align: center;
      color: var(--text-light);
      margin-bottom: 2rem;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 0.75rem 0;
      border-bottom: 1px solid var(--border);
    }

    .detail-row .label {
      font-weight: 500;
      color: var(--text-light);
    }

    .detail-row .value {
      color: var(--text);
    }

    .profile-actions {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-top: 2rem;
    }

    .btn-primary, .btn-secondary {
      padding: 0.75rem 1rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .btn-primary {
      background: #667eea;
      color: white;
    }

    .btn-secondary {
      background: var(--background);
      color: var(--text);
      border: 1px solid var(--border);
    }

    .user-details {
      flex: 1;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
      color: var(--text-light);
      font-size: 0.9rem;
    }

    .icon {
      font-size: 1rem;
    }

    .user-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 1rem;
    }

    .btn-round {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.9rem;
      transition: all 0.2s ease;
    }

    .btn-primary {
      background: var(--primary);
      color: white;
    }

    .btn-secondary {
      background: #6b7280;
      color: white;
    }

    .btn-danger {
      background: #ef4444;
      color: white;
    }

    .btn-round:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
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
      max-width: 500px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    }

    @media (max-width: 768px) {
      .container {
        padding: 1rem;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .controls {
        flex-direction: column;
        align-items: stretch;
      }

      .search-filter-group {
        flex-direction: column;
      }

      .action-buttons {
        justify-content: center;
      }

      .table-container {
        overflow-x: auto;
      }

      .data-table {
        min-width: 800px;
      }

      .pagination {
        flex-direction: column;
        gap: 1rem;
      }

      .profile-sidebar {
        width: 100vw;
        right: -100vw;
      }

      .modal-card {
        width: 95%;
        padding: 1.5rem;
      }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .modal-header h3 {
      margin: 0;
      font-size: 1.5rem;
      color: var(--text);
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: var(--text-light);
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

    .form-input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 1rem;
    }

    .modal-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 2rem;
    }

    .btn-cancel, .btn-save {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
    }

    .btn-cancel {
      background: #f3f4f6;
      color: var(--text);
    }

    .btn-save {
      background: #3b82f6;
      color: white;
    }

    .details-popup {
      background: var(--surface);
      border-radius: 12px;
      padding: 2rem;
      width: 90%;
      max-width: 400px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    }

    .popup-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--border);
    }

    .popup-header h3 {
      margin: 0;
      color: var(--text);
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .user-avatar-large {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .user-basic h4 {
      margin: 0 0 0.25rem 0;
      color: var(--text);
    }

    .user-basic p {
      margin: 0;
      color: var(--text-light);
      font-size: 0.9rem;
    }

    .details-grid {
      display: grid;
      gap: 1rem;
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      padding: 0.75rem 0;
      border-bottom: 1px solid var(--border);
    }

    .detail-label {
      font-weight: 500;
      color: var(--text-light);
    }

    .detail-value {
      color: var(--text);
      font-weight: 500;
    }
  `]
})
export class Users implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  paginatedUsers: User[] = [];
  searchTerm = '';
  roleFilter = '';
  showEditModal = false;
  showProfileSidebar = false;
  showDetailsPopup = false;
  editingUser: User = { id: 0, userName: '', email: '', department: '', userRole: 0 };
  selectedUser: User | null = null;
  selectedRole = 'Employee';
  private searchTimeout: any;
  
  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  
  // Sorting
  sortField = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  
  // Stats
  totalUsers = 0;
  activeUsers = 0;
  newUsers = 0;
  
  Math = Math;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    console.log('Attempting to load users from API...');
    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        console.log('Users loaded successfully:', users);
        console.log('First user role:', users[0]?.userRole);
        this.users = users || [];
        this.loadBookingCounts();
        this.updateStats();
        this.filterUsers();
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.users = [];
        this.updateStats();
        this.filterUsers();
      }
    });
  }

  onSearchInput() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.filterUsers();
    }, 300);
  }

  filterUsers() {
    let filtered = this.users;
    
    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.userName.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.department.toLowerCase().includes(term)
      );
    }
    
    // Apply role filter
    if (this.roleFilter) {
      const roleMap = { 'Employee': 0, 'Manager': 1, 'Admin': 2 };
      const roleValue = roleMap[this.roleFilter as keyof typeof roleMap];
      filtered = filtered.filter(user => user.userRole === roleValue);
    }
    
    this.filteredUsers = filtered;
    this.updatePagination();
  }
  
  updatePagination() {
    this.totalPages = Math.ceil(this.filteredUsers.length / this.pageSize);
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);
    
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedUsers = this.filteredUsers.slice(startIndex, endIndex);
  }
  
  sort(field: string) {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    
    this.filteredUsers.sort((a, b) => {
      let aValue = this.getFieldValue(a, field);
      let bValue = this.getFieldValue(b, field);
      
      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    this.updatePagination();
  }
  
  getFieldValue(user: User, field: string): any {
    switch (field) {
      case 'userName': return user.userName.toLowerCase();
      case 'email': return user.email.toLowerCase();
      case 'roles': return user.userRole || 0;
      case 'department': return user.department.toLowerCase();
      default: return '';
    }
  }
  
  getSortIcon(field: string): string {
    if (this.sortField !== field) return '↕';
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }
  
  // Pagination methods
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }
  
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }
  
  goToPage(page: number) {
    this.currentPage = page;
    this.updatePagination();
  }
  
  getPageNumbers(): number[] {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }
  
  showUserProfile(user: User) {
    this.selectedUser = user;
    this.showProfileSidebar = true;
  }
  
  closeProfileSidebar() {
    this.showProfileSidebar = false;
    this.selectedUser = null;
  }
  
  exportData(format: 'csv' | 'excel') {
    const data = this.filteredUsers.map(user => ({
      'User ID': user.id,
      'Name': user.userName,
      'Email': user.email,
      'Role': this.getDisplayRole(user.userRole),
      'Department': user.department,
      'Total Bookings': user.totalBookings || 0
    }));

    if (format === 'csv') {
      this.downloadCSV(data);
    } else {
      this.downloadExcel(data);
    }
  }

  private downloadCSV(data: any[]) {
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private downloadExcel(data: any[]) {
    const headers = Object.keys(data[0]);
    let excelContent = '<table>';
    
    // Add headers
    excelContent += '<tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr>';
    
    // Add data rows
    data.forEach(row => {
      excelContent += '<tr>' + headers.map(h => `<td>${row[h]}</td>`).join('') + '</tr>';
    });
    
    excelContent += '</table>';
    
    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `users_${new Date().toISOString().split('T')[0]}.xls`;
    link.click();
    window.URL.revokeObjectURL(url);
  }
  
  updateStats() {
    this.totalUsers = this.users.length;
    this.activeUsers = this.users.length; // Assuming all users are active for now
    this.newUsers = Math.floor(this.users.length * 0.1); // 10% as new users
  }

  addUser() {
    console.log('Add new user');
    alert('Add User functionality\n\nThis will open a form to create a new user.');
  }

  editUser(user: User) {
    this.editingUser = { ...user };
    this.selectedRole = this.getDisplayRole(user.userRole);
    this.showEditModal = true;
  }

  closeModal() {
    this.showEditModal = false;
  }

  saveUser() {
    const payload = {
      department: this.editingUser.department,
      role: this.selectedRole as 'Employee' | 'Manager' | 'Admin'
    };
    
    this.adminService.updateUser(this.editingUser.id, payload).subscribe({
      next: () => {
        console.log('User updated successfully');
        this.loadUsers();
        this.closeModal();
      },
      error: (error) => {
        console.error('Error updating user:', error);
      }
    });
  }

  showUserDetails(user: User) {
    this.selectedUser = user;
    this.showDetailsPopup = true;
  }

  closeDetailsPopup() {
    this.showDetailsPopup = false;
    this.selectedUser = null;
  }

  viewUserBookings(userId: number) {
    // TODO: Implement viewBookingByUserId functionality
    console.log('View bookings for user:', userId);
    alert(`View booking history for User ID: ${userId}\n\nThis feature will show all bookings made by this user.`);
  }

  loadBookingCounts() {
    this.users.forEach(user => {
      this.adminService.getUserBookingCount(user.id).subscribe({
        next: (count) => {
          user.totalBookings = count;
        },
        error: (error) => {
          console.error(`Error loading booking count for user ${user.id}:`, error);
          user.totalBookings = 0;
        }
      });
    });
  }

  deleteUser(userId: number) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.adminService.deleteUser(userId).subscribe({
        next: () => {
          console.log('User deleted successfully');
          this.loadUsers();
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          alert('Failed to delete user');
        }
      });
    }
  }

  getRoleClass(userRole: number): string {
    const roleMap: { [key: number]: string } = { 0: 'employee', 1: 'manager', 2: 'admin' };
    return roleMap[userRole] || 'employee';
  }

  getDisplayRole(userRole: number): string {
    const roleMap: { [key: number]: string } = { 0: 'Employee', 1: 'Manager', 2: 'Admin' };
    return roleMap[userRole] || 'Employee';
  }
}