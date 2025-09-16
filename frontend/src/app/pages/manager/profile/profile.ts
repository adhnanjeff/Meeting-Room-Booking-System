import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../../services/auth.service';
import { BookingService } from '../../../services/booking.service';
import { LoaderService } from '../../../services/loader.service';

@Component({
  selector: 'app-manager-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="page-header-card">
        <div class="page-header">
          <h1><i class="pi pi-user"></i> Profile</h1>
          <p>Manage your account information and preferences</p>
        </div>
      </div>

      <div class="profile-layout">
        <!-- Left Column - Profile Info -->
        <div class="left-column">
          <div class="profile-card">
            <div class="avatar-section">
              <div class="profile-avatar" (mouseenter)="showUploadOption = true" (mouseleave)="showUploadOption = false">
                {{ getUserInitials() }}
                <div class="upload-overlay" *ngIf="showUploadOption" (click)="uploadProfilePicture()">
                  <i class="pi pi-camera"></i>
                  <span>Upload</span>
                </div>
              </div>
              <h2>{{ currentUser?.userName }}</h2>
              <p class="role"><i class="pi pi-briefcase"></i> {{ currentUser?.roles?.[0] || 'Manager' }}</p>
            </div>
          </div>

          <div class="info-card">
            <h3><i class="pi pi-info-circle"></i> Personal Information</h3>
            <div class="info-grid">
              <div class="info-item">
                <label><i class="pi pi-envelope"></i> Email</label>
                <span>{{ currentUser?.email }}</span>
              </div>
              
              <div class="info-item">
                <label><i class="pi pi-building"></i> Department</label>
                <span>{{ currentUser?.department || 'Not specified' }}</span>
              </div>
              
              <div class="info-item" *ngIf="currentUser?.managerName">
                <label><i class="pi pi-user"></i> Manager</label>
                <span>{{ currentUser?.managerName }}</span>
              </div>

              <div class="info-item">
                <label><i class="pi pi-phone"></i> Phone</label>
                <span>{{ phoneNumber || 'Not provided' }}</span>
              </div>

              <div class="info-item">
                <label><i class="pi pi-id-card"></i> Employee ID</label>
                <span>{{ employeeId || 'MGR' + currentUser?.id }}</span>
              </div>

              <div class="info-item">
                <label><i class="pi pi-map-marker"></i> Location</label>
                <span>{{ location || 'Office' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column - Actions & Activity -->
        <div class="right-column">
          <div class="actions-card">
            <h3><i class="pi pi-cog"></i> Quick Actions</h3>
            <div class="action-buttons">
              <button class="action-btn primary" (click)="toggleEditMode()">
                <i class="pi pi-pencil"></i>
                {{ isEditMode ? 'Save Changes' : 'Edit Profile' }}
              </button>
              <button class="action-btn secondary" (click)="changePassword()">
                <i class="pi pi-lock"></i>
                Change Password
              </button>
              <button class="action-btn secondary" (click)="uploadProfilePicture()">
                <i class="pi pi-image"></i>
                Upload Picture
              </button>
            </div>
          </div>

          <div class="activity-card">
            <h3><i class="pi pi-chart-line"></i> Management Summary</h3>
            <div class="activity-stats">
              <div class="stat-item">
                <div class="stat-number">{{ totalMeetings }}</div>
                <div class="stat-label"><i class="pi pi-calendar"></i> Total Meetings</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ pendingApprovals }}</div>
                <div class="stat-label"><i class="pi pi-clock"></i> Pending Approvals</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ teamSize }}</div>
                <div class="stat-label"><i class="pi pi-users"></i> Team Members</div>
              </div>
            </div>
          </div>

          <div class="preferences-card">
            <h3><i class="pi pi-sliders-h"></i> Preferences</h3>
            <div class="preference-items">
              <div class="preference-item">
                <label><i class="pi pi-bell"></i> Email Notifications</label>
                <input type="checkbox" [(ngModel)]="emailNotifications" class="toggle-switch">
              </div>
              <div class="preference-item">
                <label><i class="pi pi-mobile"></i> SMS Reminders</label>
                <input type="checkbox" [(ngModel)]="smsReminders" class="toggle-switch">
              </div>
              <div class="preference-item">
                <label><i class="pi pi-globe"></i> Time Zone</label>
                <select [(ngModel)]="timeZone" class="preference-select">
                  <option value="UTC+05:30">India Standard Time (UTC+05:30)</option>
                  <option value="UTC+00:00">UTC</option>
                  <option value="UTC-05:00">Eastern Time (UTC-05:00)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Edit Mode Modal -->
      <div class="modal-overlay" *ngIf="isEditMode" (click)="closeEditMode()">
        <div class="edit-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3><i class="pi pi-pencil"></i> Edit Profile</h3>
            <button class="close-btn" (click)="closeEditMode()">×</button>
          </div>
          <div class="modal-body">
            <div class="edit-form">
              <div class="form-group">
                <label><i class="pi pi-user"></i> Full Name</label>
                <input type="text" [(ngModel)]="editForm.userName" class="form-input">
              </div>
              <div class="form-group">
                <label><i class="pi pi-phone"></i> Phone Number</label>
                <input type="tel" [(ngModel)]="editForm.phone" class="form-input">
              </div>
              <div class="form-group">
                <label><i class="pi pi-building"></i> Department</label>
                <input type="text" [(ngModel)]="editForm.department" class="form-input">
              </div>
              <div class="form-group">
                <label><i class="pi pi-map-marker"></i> Location</label>
                <input type="text" [(ngModel)]="editForm.location" class="form-input">
              </div>
            </div>
            <div class="modal-actions">
              <button class="btn-cancel" (click)="closeEditMode()">Cancel</button>
              <button class="btn-save" (click)="saveProfile()">Save Changes</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Change Password Modal -->
      <div class="modal-overlay" *ngIf="showChangePasswordModal" (click)="closeChangePasswordModal()">
        <div class="edit-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3><i class="pi pi-lock"></i> Change Password</h3>
            <button class="close-btn" (click)="closeChangePasswordModal()">×</button>
          </div>
          <div class="modal-body">
            <div class="edit-form">
              <div class="form-group">
                <label><i class="pi pi-lock"></i> Current Password</label>
                <input type="password" [(ngModel)]="changePasswordForm.currentPassword" class="form-input" placeholder="Enter current password">
              </div>
              <div class="form-group">
                <label><i class="pi pi-key"></i> New Password</label>
                <input type="password" [(ngModel)]="changePasswordForm.newPassword" class="form-input" placeholder="Enter new password">
              </div>
              <div class="form-group">
                <label><i class="pi pi-key"></i> Confirm New Password</label>
                <input type="password" [(ngModel)]="changePasswordForm.confirmPassword" class="form-input" placeholder="Confirm new password">
              </div>
            </div>
            <div class="message" *ngIf="changePasswordMessage" [class.success]="changePasswordMessage.includes('successfully')">{{ changePasswordMessage }}</div>
            <div class="modal-actions">
              <button class="btn-cancel" (click)="closeChangePasswordModal()">Cancel</button>
              <button class="btn-save" (click)="submitChangePassword()">Change Password</button>
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
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%);
      min-height: 100vh;
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

    .profile-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }

    .left-column, .right-column {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .profile-card, .info-card, .actions-card, .activity-card, .preferences-card {
      background: var(--surface);
      border-radius: 12px;
      padding: 2rem;
      box-shadow: var(--shadow);
      border: 1px solid var(--border);
    }

    .avatar-section {
      text-align: center;
      margin-bottom: 1rem;
    }

    .profile-avatar {
      width: 120px;
      height: 120px;
      background: linear-gradient(135deg, var(--primary) 0%, #1d4ed8 100%);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0 auto 1rem;
      position: relative;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .profile-avatar:hover {
      transform: scale(1.05);
    }

    .upload-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 0.875rem;
      gap: 0.25rem;
    }

    .avatar-section h2 {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 0.5rem;
    }

    .role {
      color: var(--primary);
      font-weight: 600;
      font-size: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .info-card h3, .actions-card h3, .activity-card h3, .preferences-card h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      border-bottom: 2px solid var(--border);
      padding-bottom: 0.5rem;
    }

    .info-grid {
      display: grid;
      gap: 1.25rem;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding: 1rem;
      background: var(--background);
      border-radius: 8px;
      border-left: 4px solid var(--primary);
    }

    .info-item label {
      font-weight: 600;
      color: var(--text-light);
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .info-item span {
      color: var(--text);
      font-size: 1rem;
      font-weight: 500;
    }

    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .action-btn {
      padding: 1rem;
      border: none;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .action-btn.primary {
      background: var(--primary);
      color: white;
    }

    .action-btn.secondary {
      background: var(--background);
      color: var(--text);
      border: 1px solid var(--border);
    }

    .action-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .activity-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }

    .stat-item {
      text-align: center;
      padding: 1rem;
      background: var(--background);
      border-radius: 8px;
      border: 1px solid var(--border);
    }

    .stat-number {
      font-size: 2rem;
      font-weight: 700;
      color: var(--primary);
      margin-bottom: 0.5rem;
    }

    .stat-label {
      font-size: 0.75rem;
      color: var(--text-light);
      font-weight: 500;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.25rem;
    }

    .preference-items {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .preference-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: var(--background);
      border-radius: 8px;
      border: 1px solid var(--border);
    }

    .preference-item label {
      font-weight: 500;
      color: var(--text);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .toggle-switch {
      width: 40px;
      height: 20px;
      cursor: pointer;
    }

    .preference-select {
      padding: 0.5rem;
      border: 1px solid var(--border);
      border-radius: 6px;
      background: var(--surface);
      color: var(--text);
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

    .edit-modal {
      background: var(--surface);
      border-radius: 12px;
      width: 90%;
      max-width: 500px;
      box-shadow: var(--shadow-lg);
      border: 1px solid var(--border);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid var(--border);
    }

    .modal-header h3 {
      margin: 0;
      color: var(--text);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: var(--text-light);
    }

    .modal-body {
      padding: 1.5rem;
    }

    .edit-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group label {
      font-weight: 600;
      color: var(--text);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .form-input {
      padding: 0.75rem;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: var(--surface);
      color: var(--text);
    }

    .modal-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    }

    .btn-cancel, .btn-save {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-cancel {
      background: var(--background);
      color: var(--text);
      border: 1px solid var(--border);
    }

    .btn-save {
      background: var(--primary);
      color: white;
    }

    .message {
      padding: 0.75rem;
      border-radius: 8px;
      margin: 1rem 0;
      font-size: 0.875rem;
      background: var(--error-bg);
      color: var(--error-text);
    }

    .message.success {
      background: var(--success-bg);
      color: var(--success-text);
    }

    @media (max-width: 768px) {
      .container {
        padding: 1rem;
      }

      .profile-layout {
        grid-template-columns: 1fr;
      }

      .activity-stats {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ManagerProfile implements OnInit {
  currentUser: User | null = null;
  showUploadOption = false;
  isEditMode = false;
  phoneNumber = '';
  employeeId = '';
  location = '';
  totalMeetings = 0;
  pendingApprovals = 0;
  teamSize = 0;
  emailNotifications = true;
  smsReminders = false;
  timeZone = 'UTC+05:30';
  showChangePasswordModal = false;
  changePasswordMessage = '';
  
  editForm = {
    userName: '',
    phone: '',
    department: '',
    location: ''
  };

  changePasswordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  constructor(
    private authService: AuthService,
    private bookingService: BookingService,
    private loaderService: LoaderService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadUserStats();
  }

  getUserInitials(): string {
    if (!this.currentUser?.userName) return 'M';
    return this.currentUser.userName.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  toggleEditMode(): void {
    if (this.isEditMode) {
      this.saveProfile();
    } else {
      this.isEditMode = true;
      this.editForm = {
        userName: this.currentUser?.userName || '',
        phone: this.phoneNumber,
        department: this.currentUser?.department || '',
        location: this.location
      };
    }
  }

  closeEditMode(): void {
    this.isEditMode = false;
  }

  saveProfile(): void {
    this.phoneNumber = this.editForm.phone;
    this.location = this.editForm.location;
    this.isEditMode = false;
  }

  changePassword(): void {
    this.showChangePasswordModal = true;
    this.changePasswordForm = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    this.changePasswordMessage = '';
  }

  uploadProfilePicture(): void {
    console.log('Upload profile picture clicked');
  }

  loadUserStats(): void {
    if (this.currentUser) {
      this.bookingService.getAllBookings().subscribe({
        next: (bookings) => {
          this.totalMeetings = bookings.filter(b => b.organizerId === this.currentUser!.id).length;
          this.pendingApprovals = bookings.filter(b => b.status === 'Pending').length;
          this.teamSize = 5; // Mock data
        },
        error: () => {
          this.totalMeetings = 0;
          this.pendingApprovals = 0;
          this.teamSize = 0;
        }
      });
    }
  }

  closeChangePasswordModal(): void {
    this.showChangePasswordModal = false;
    this.changePasswordMessage = '';
  }

  submitChangePassword(): void {
    if (!this.changePasswordForm.currentPassword || !this.changePasswordForm.newPassword || !this.changePasswordForm.confirmPassword) {
      this.changePasswordMessage = 'Please fill in all fields';
      return;
    }

    if (this.changePasswordForm.newPassword.length < 6) {
      this.changePasswordMessage = 'New password must be at least 6 characters long';
      return;
    }

    if (this.changePasswordForm.newPassword !== this.changePasswordForm.confirmPassword) {
      this.changePasswordMessage = 'New passwords do not match';
      return;
    }

    this.loaderService.show('Changing password...');
    this.authService.changePassword(this.changePasswordForm.currentPassword, this.changePasswordForm.newPassword).subscribe({
      next: () => {
        this.changePasswordMessage = 'Password changed successfully! A confirmation email has been sent.';
        this.changePasswordForm = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
        this.loaderService.hide();
        setTimeout(() => {
          this.closeChangePasswordModal();
        }, 2000);
      },
      error: (error) => {
        this.changePasswordMessage = error.error?.errors?.[0]?.description || 'Failed to change password. Please check your current password.';
        this.loaderService.hide();
      }
    });
  }
}