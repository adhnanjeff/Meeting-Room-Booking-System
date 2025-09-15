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
      <div class="page-header-card">
        <div class="page-header">
          <h1>👥 User Management</h1>
          <p>Manage users and their roles</p>
        </div>
      </div>

      <div class="controls">
        <div class="search-box">
          <input 
            type="text" 
            placeholder="Search users..."
            [(ngModel)]="searchTerm"
            (input)="filterUsers()"
          >
          <span class="search-icon"><i class="pi pi-search"></i></span>
        </div>
        <button class="btn-add" (click)="addUser()" title="Add User">
          <i class="pi pi-plus"></i>
        </button>
      </div>

      <div class="cards-grid">
        <div 
          *ngFor="let user of filteredUsers" 
          class="user-card"
          [class.admin]="user.roles.includes('Admin')"
          [class.manager]="user.roles.includes('Manager')"
          [class.employee]="user.roles.includes('Employee')"
        >
          <div class="user-header">
            <h3>{{ user.userName }}</h3>
            <span class="role-badge" 
              [class.admin]="user.roles.includes('Admin')"
              [class.manager]="user.roles.includes('Manager')"
              [class.employee]="user.roles.includes('Employee')">
              {{ user.roles[0] || 'Employee' }}
            </span>
          </div>
          
          <div class="user-details">
            <div class="detail-item">
              <span class="icon">📧</span>
              <span>{{ user.email }}</span>
            </div>
            
            <div class="detail-item">
              <span class="icon">🏢</span>
              <span>{{ user.department }}</span>
            </div>
            
            <div class="detail-item">
              <span class="icon">🆔</span>
              <span>User ID: {{ user.id }}</span>
            </div>
            

          </div>
          
          <div class="user-actions">
            <button class="btn-round btn-primary" (click)="viewUserBookings(user.id)" title="View Bookings"><i class="pi pi-search"></i></button>
            <button class="btn-round btn-secondary" (click)="editUser(user)" title="Edit User"><i class="pi pi-file-edit"></i></button>
            <button class="btn-round btn-danger" (click)="deleteUser(user.id)" title="Delete User"><i class="pi pi-trash"></i></button>
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

    .controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      gap: 1rem;
    }

    .search-box {
      position: relative;
      flex: 1;
      max-width: 400px;
    }

    .search-box input {
      width: 100%;
      padding: 0.75rem 2.5rem 0.75rem 1rem;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: var(--surface);
      color: var(--text);
      font-size: 1rem;
    }

    .search-icon {
      position: absolute;
      right: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-light);
    }

    .btn-add {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      border: none;
      background: #f59e0b;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      transition: all 0.2s ease;
    }

    .btn-add:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }

    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .user-card {
      background: var(--surface);
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: var(--shadow);
      border: 2px solid transparent;
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 220px;
    }

    .user-card.admin {
      border-color: #dc2626;
      background: linear-gradient(135deg, #fef2f2 0%, var(--surface) 100%);
    }

    .user-card.manager {
      border-color: #f59e0b;
      background: linear-gradient(135deg, #fffbeb 0%, var(--surface) 100%);
    }

    .user-card.employee {
      border-color: #3b82f6;
      background: linear-gradient(135deg, #eff6ff 0%, var(--surface) 100%);
    }

    [data-theme="dark"] .user-card.admin {
      background: linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, var(--surface) 100%);
    }

    [data-theme="dark"] .user-card.manager {
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, var(--surface) 100%);
    }

    [data-theme="dark"] .user-card.employee {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, var(--surface) 100%);
    }

    .user-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .user-header h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text);
      margin: 0;
    }

    .role-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
      color: white;
    }

    .role-badge.admin {
      background: #dc2626;
    }

    .role-badge.manager {
      background: #f59e0b;
    }

    .role-badge.employee {
      background: #3b82f6;
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

      .cards-grid {
        grid-template-columns: 1fr;
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
  `]
})
export class Users implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchTerm = '';
  showEditModal = false;
  editingUser: User = { id: 0, userName: '', email: '', department: '', roles: [] };
  selectedRole = 'Employee';

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    console.log('Attempting to load users from API...');
    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        console.log('Users loaded successfully:', users);
        this.users = users;
        this.filterUsers();
      },
      error: (error) => {
        console.error('Error loading users:', error);
        // Add some mock data for testing
        this.users = [
          { id: 1, userName: 'John Doe', email: 'john.doe@company.com', department: 'IT', roles: ['Admin'] },
          { id: 2, userName: 'Jane Smith', email: 'jane.smith@company.com', department: 'HR', roles: ['Manager'] },
          { id: 3, userName: 'Bob Johnson', email: 'bob.johnson@company.com', department: 'IT', roles: ['Employee'] }
        ];
        this.filterUsers();
      }
    });
  }

  filterUsers() {
    if (!this.searchTerm) {
      this.filteredUsers = this.users;
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredUsers = this.users.filter(user =>
        user.userName.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.department.toLowerCase().includes(term)
      );
    }
  }

  addUser() {
    console.log('Add new user');
    alert('Add User functionality\n\nThis will open a form to create a new user.');
  }

  editUser(user: User) {
    this.editingUser = { ...user };
    this.selectedRole = user.roles[0] || 'Employee';
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

  viewUserBookings(userId: number) {
    // TODO: Implement viewBookingByUserId functionality
    console.log('View bookings for user:', userId);
    alert(`View booking history for User ID: ${userId}\n\nThis feature will show all bookings made by this user.`);
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
}