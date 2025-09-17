import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MeetingRoomService, MeetingRoom } from '../../../services/meetingroom.service';
import { AuthService, User } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { BookingService, BookingRequest } from '../../../services/booking.service';
import { UserService } from '../../../services/user.service';
import { NotificationService } from '../../../services/notification.service';
import { LoaderService } from '../../../services/loader.service';

interface AttendeeTag {
  id: number;
  name: string;
  role: string;
}

interface DateOption {
  date: Date;
  dayName: string;
  day: number;
  monthName: string;
  dateString: string;
  isWeekend: boolean;
  isHoliday: boolean;
  holidayName?: string;
  isDisabled: boolean;
}

interface MeetingRequest {
  roomId: number;
  organizerId: number;
  title: string;
  startTime: string;
  endTime: string;
  purpose: string;
  attendeeCount: number;
  attendeeIds: number[];
  attendeeNames: string[];
  isEmergency: boolean;
  refreshmentRequests?: string;
}

@Component({
  selector: 'app-book-room',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="sticky-header" [class.visible]="showStickyHeader">
      <div class="sticky-content">
        <div class="sticky-left">
          <div class="sticky-icon">
            <i class="pi pi-calendar"></i>
          </div>
          <h2>Request Meeting Approval</h2>
        </div>
        <div class="sticky-right">
          <div class="quick-actions">
            <button class="action-btn" title="Notifications">
              <i class="pi pi-bell"></i>
              <span class="notification-badge">3</span>
            </button>
            <button class="action-btn" title="Calendar">
              <i class="pi pi-calendar-plus"></i>
            </button>
          </div>
          <div class="user-profile">
            <div class="role-badge">Employee</div>
            <div class="user-avatar">
              <div class="avatar-circle">
                {{ currentUser?.userName?.charAt(0)?.toUpperCase() || 'U' }}
              </div>
              <div class="user-info">
                <span class="user-name">{{ currentUser?.userName || 'User' }}</span>
                <span class="user-dept">{{ currentUser?.department || 'Department' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="container">
      <div class="enhanced-header">
        <div class="header-left">
          <div class="page-icon">
            <i class="pi pi-calendar"></i>
          </div>
          <div class="page-info">
            <h1>Request Meeting Approval</h1>
            <p>Submit your meeting request for manager approval</p>
          </div>
        </div>
      </div>

      <div class="date-selector-container">
        <h3>Select Date</h3>
        <div class="date-scroll">
          <div *ngFor="let date of availableDates; let i = index" 
               class="date-item" 
               [class.selected]="selectedDateIndex === i"
               [class.disabled]="date.isDisabled"
               [class.weekend]="date.isWeekend"
               [class.holiday]="date.isHoliday"
               [title]="date.isHoliday ? date.holidayName : (date.isWeekend ? 'Weekend' : '')"
               (click)="selectDate(i)">
            <div class="date-day">{{ date.dayName }}</div>
            <div class="date-number">
              {{ date.day }}
              <span *ngIf="date.isHoliday" class="holiday-indicator"><i class="pi pi-star"></i></span>
            </div>
            <div class="date-month">{{ date.monthName }}</div>
          </div>
        </div>
      </div>

      <div class="booking-form">
        <div class="form-section">
          <h3>Meeting Details</h3>
          <div class="form-group">
            <label>Meeting Title</label>
            <input type="text" [(ngModel)]="meetingRequest.title" class="form-input" placeholder="Enter meeting title" required>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Start Time</label>
              <input type="time" [(ngModel)]="startTime" (ngModelChange)="onTimeChange()" class="form-input" required>
            </div>
            <div class="form-group">
              <label>End Time</label>
              <input type="time" [(ngModel)]="endTime" (ngModelChange)="onTimeChange()" class="form-input" required>
            </div>
          </div>
          
          <div class="form-group">
            <label>Total People in Meeting</label>
            <input type="number" [(ngModel)]="meetingRequest.attendeeCount" (ngModelChange)="filterRooms()" 
                   class="form-input" min="1" placeholder="Enter total number of people">
          </div>
          
          <div class="form-group">
            <label>Meeting Purpose</label>
            <input type="text" [(ngModel)]="meetingRequest.purpose" class="form-input" placeholder="Enter meeting purpose">
          </div>
          
          <div class="form-group">
            <label>
              <input type="checkbox" [(ngModel)]="meetingRequest.isEmergency">
              Emergency Meeting Request
            </label>
          </div>
          

          
          <div class="form-group">
            <label>Refreshment Requests (Optional)</label>
            <textarea [(ngModel)]="meetingRequest.refreshmentRequests" 
                      class="form-input" 
                      placeholder="Any special refreshment requirements..." 
                      rows="3"></textarea>
          </div>
        </div>

        <div class="form-section">
          <h3>Attendee Information ({{ attendeeTags.length }} attendees)</h3>
          <div class="attendee-input-section">
            <div class="input-row">
              <input type="number" [(ngModel)]="newAttendeeId" placeholder="Enter User ID" class="form-input" (keyup.enter)="addAttendeeById()">
              <button class="btn-add" (click)="addAttendeeById()" [disabled]="!newAttendeeId">
                + Add by ID
              </button>
            </div>
          </div>
          
          <div class="attendee-tags" *ngIf="attendeeTags.length > 0">
            <div *ngFor="let attendee of attendeeTags; let i = index" class="attendee-tag">
              <span class="attendee-info">{{ attendee.name }} (ID: {{ attendee.id }})</span>
              <div class="role-selector">
                <div class="role-badge" [class]="'role-' + attendee.role.toLowerCase().replace(' ', '-')" (click)="toggleRoleDropdown(i)">
                  {{ attendee.role }}
                  <i class="pi pi-chevron-down"></i>
                </div>
                <div class="role-dropdown" *ngIf="activeRoleDropdown === i">
                  <div class="role-option" [class.active]="attendee.role === 'Participant'" (click)="selectRole(attendee, 'Participant', i)">
                    <i class="pi pi-user"></i> Participant
                  </div>
                  <div class="role-option" [class.active]="attendee.role === 'Presenter'" (click)="selectRole(attendee, 'Presenter', i)">
                    <i class="pi pi-microphone"></i> Presenter
                  </div>
                  <div class="role-option" [class.active]="attendee.role === 'Note Taker'" (click)="selectRole(attendee, 'Note Taker', i)">
                    <i class="pi pi-file-edit"></i> Note Taker
                  </div>
                  <div class="role-option" [class.active]="attendee.role === 'Moderator'" (click)="selectRole(attendee, 'Moderator', i)">
                    <i class="pi pi-shield"></i> Moderator
                  </div>
                </div>
              </div>
              <button class="tag-remove" (click)="removeAttendee(i)">×</button>
            </div>
          </div>
        </div>
      </div>

      <div class="rooms-section">
        <h3>Available Rooms ({{ filteredRooms.length }})</h3>
        <div class="cards-grid">
          <div 
            *ngFor="let room of filteredRooms" 
            class="room-card"
            [class.available]="room.isAvailable"
            [class.booked]="!room.isAvailable"
            [class.selected]="meetingRequest.roomId === room.id"
            (click)="selectRoom(room)"
          >
            <div class="room-header">
              <h4>{{ room.roomName }}</h4>
              <span class="capacity-badge">{{ room.capacity }} people</span>
            </div>
            
            <div class="room-details">
              <div class="detail-item">
                <span class="icon"><i class="pi pi-cog"></i></span>
                <span>{{ room.amenities }}</span>
              </div>
              
              <div class="detail-item">
                <span class="icon"><i class="pi pi-chart-bar"></i></span>
                <span>Capacity: {{ room.capacity }}</span>
              </div>
            </div>
            
            <div class="room-actions">
              <button class="btn-select" [disabled]="!room.isAvailable" (click)="selectRoom(room)">
                {{ room.isAvailable ? (meetingRequest.roomId === room.id ? 'Selected' : 'Select Room') : 'Not Available' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="submit-section" *ngIf="meetingRequest.roomId > 0">
        <div class="error" *ngIf="error">{{ error }}</div>
        <div class="success" *ngIf="success">{{ success }}</div>
        
        <button class="btn-request-approval" (click)="requestApproval()" [disabled]="isLoading || !isFormValid()">
          <span *ngIf="isLoading">Submitting Request...</span>
          <span *ngIf="!isLoading"><i class="pi pi-send"></i> Request Approval</span>
        </button>
        
        <p class="approval-note">
          Your request will be sent to your manager for approval. You'll be notified once it's reviewed.
        </p>
      </div>
    </div>
  `,
  styles: [`
    .sticky-header {
      position: fixed;
      top: 0;
      left: 280px;
      right: 0;
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      z-index: 999;
      transform: translateY(-100%);
      transition: transform 0.3s ease;
    }

    .sticky-header.visible {
      transform: translateY(0);
    }

    .sticky-content {
      padding: 1rem 2rem;
      max-width: calc(1400px - 280px);
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .sticky-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .sticky-icon {
      background: var(--primary);
      color: white;
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
    }

    .sticky-content h2 {
      margin: 0;
      font-size: 1.3rem;
      font-weight: 600;
      color: var(--text);
    }

    .sticky-right {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    @media (max-width: 768px) {
      .sticky-header {
        left: 0;
        top: 70px;
      }
      
      .sticky-content {
        max-width: 100%;
        padding: 1rem;
        flex-direction: column;
        gap: 1rem;
      }
      
      .sticky-right {
        gap: 1rem;
      }
      
      .user-info {
        display: none;
      }
    }

    .container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .enhanced-header {
      background: linear-gradient(135deg, var(--surface) 0%, var(--background) 100%);
      border-radius: 16px;
      padding: 1.5rem 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      border: 1px solid var(--border);
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .page-icon {
      background: var(--primary);
      color: white;
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }

    .page-info h1 {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text);
      margin: 0 0 0.25rem 0;
    }

    .page-info p {
      color: var(--text-light);
      margin: 0;
      font-size: 0.9rem;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .quick-actions {
      display: flex;
      gap: 0.5rem;
    }

    .action-btn {
      position: relative;
      width: 40px;
      height: 40px;
      border-radius: 10px;
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--text);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .action-btn:hover {
      background: var(--primary);
      color: white;
      transform: translateY(-1px);
    }

    .notification-badge {
      position: absolute;
      top: -6px;
      right: -6px;
      background: #ef4444;
      color: white;
      font-size: 0.7rem;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 10px;
      min-width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .user-profile {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .role-badge {
      background: var(--primary);
      color: white;
      padding: 0.4rem 0.8rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .user-avatar {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .avatar-circle {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary), #6366f1);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 1.1rem;
    }

    .user-info {
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-weight: 600;
      color: var(--text);
      font-size: 0.9rem;
    }

    .user-dept {
      font-size: 0.8rem;
      color: var(--text-light);
    }

    .date-selector-container {
      background: var(--surface);
      border-radius: 12px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      border: 1px solid var(--border);
    }

    .date-selector-container h3 {
      margin-bottom: 1rem;
      color: var(--text);
    }

    .date-scroll {
      display: flex;
      gap: 1rem;
      overflow-x: auto;
      padding: 1rem 0;
      scrollbar-width: thin;
    }

    .date-scroll::-webkit-scrollbar {
      height: 6px;
    }

    .date-scroll::-webkit-scrollbar-track {
      background: var(--border);
      border-radius: 3px;
    }

    .date-scroll::-webkit-scrollbar-thumb {
      background: var(--text-light);
      border-radius: 3px;
    }

    .date-scroll::-webkit-scrollbar-thumb:hover {
      background: var(--text);
    }

    .date-item {
      min-width: 80px;
      padding: 1rem;
      background: var(--background);
      border: 2px solid var(--border);
      border-radius: 12px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      flex-shrink: 0;
      color: var(--text);
    }

    .date-item:hover {
      border-color: var(--primary);
      transform: translateY(-2px);
      background: var(--surface);
    }

    .date-item.selected {
      background: var(--primary);
      border-color: var(--primary);
      color: white;
    }

    .date-item.disabled {
      opacity: 0.5;
      cursor: not-allowed;
      background: var(--background);
    }

    .date-item.weekend {
      background: var(--weekend-bg, rgba(255, 193, 7, 0.1));
      border-color: var(--weekend-border, #ffc107);
    }

    .date-item.holiday {
      background: var(--holiday-bg, rgba(220, 53, 69, 0.1));
      border-color: var(--holiday-border, #dc3545);
    }

    .date-item.disabled:hover {
      transform: none;
      background: var(--background);
    }

    .date-item.weekend.disabled:hover {
      background: var(--weekend-bg, rgba(255, 193, 7, 0.1));
    }

    .date-item.holiday.disabled:hover {
      background: var(--holiday-bg, rgba(220, 53, 69, 0.1));
    }

    .holiday-indicator {
      font-size: 0.7rem;
      margin-left: 0.2rem;
    }

    .date-day {
      font-size: 0.75rem;
      font-weight: 500;
      margin-bottom: 0.25rem;
      text-transform: uppercase;
    }

    .date-number {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 0.25rem;
    }

    .date-month {
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
    }

    .booking-form {
      background: var(--surface);
      border-radius: 12px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      border: 1px solid var(--border);
    }

    .form-section {
      margin-bottom: 2rem;
    }

    .form-section h3 {
      margin-bottom: 1rem;
      color: var(--text);
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
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
      border: 1px solid var(--border);
      border-radius: 6px;
      font-size: 1rem;
      background: var(--background);
      color: var(--text);
    }

    .form-input:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
    }

    .form-group input[type="checkbox"] {
      width: auto;
      margin-right: 0.5rem;
    }

    .attendee-input-section {
      margin-bottom: 1.5rem;
    }

    .input-row {
      display: grid;
      grid-template-columns: 1fr 1fr auto;
      gap: 1rem;
      align-items: center;
    }

    .attendee-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .attendee-tag {
      background: var(--primary-light, rgba(59, 130, 246, 0.1));
      border: 1px solid var(--primary);
      border-radius: 20px;
      padding: 0.5rem 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      position: relative;
    }

    .role-selector {
      position: relative;
    }

    .role-badge {
      background: var(--primary);
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s ease;
      min-width: 90px;
      justify-content: space-between;
    }

    .role-badge:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }

    .role-badge.role-participant {
      background: #3B82F6;
    }

    .role-badge.role-presenter {
      background: #F59E0B;
    }

    .role-badge.role-note-taker {
      background: #6B7280;
    }

    .role-badge.role-moderator {
      background: #10B981;
    }

    .role-dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      background: white;
      border: 1px solid var(--border);
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
      overflow: hidden;
      margin-top: 0.25rem;
      min-width: 140px;
      white-space: nowrap;
    }

    .role-option {
      padding: 0.75rem 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      transition: background-color 0.2s;
      font-size: 0.875rem;
      color: var(--text);
    }

    .role-option:hover {
      background: var(--background);
    }

    .role-option.active {
      background: var(--primary-light, rgba(59, 130, 246, 0.1));
      color: var(--primary);
    }

    .role-option i {
      font-size: 0.875rem;
      width: 1rem;
    }

    .attendee-info {
      color: var(--primary);
    }

    .tag-remove {
      background: #ef4444;
      color: white;
      border: none;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      cursor: pointer;
      font-size: 0.8rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-add {
      background: var(--success, #10b981);
      color: white;
      border: none;
      border-radius: 6px;
      padding: 0.75rem 1.5rem;
      cursor: pointer;
      font-weight: 500;
      white-space: nowrap;
      transition: background-color 0.2s;
    }

    .btn-add:hover:not(:disabled) {
      background: var(--success-dark, #059669);
    }

    .btn-add:disabled {
      background: var(--text-light);
      cursor: not-allowed;
    }

    .rooms-section {
      margin-bottom: 2rem;
    }

    .rooms-section h3 {
      margin-bottom: 1.5rem;
      color: var(--text);
    }

    .cards-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
    }

    .room-card {
      background: var(--surface);
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      border: 2px solid var(--border);
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .room-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .room-card.available {
      border-color: var(--success, #10b981);
    }

    .room-card.booked {
      border-color: var(--error, #ef4444);
      opacity: 0.7;
    }

    .room-card.selected {
      border-color: var(--primary);
      background: var(--primary);
      color: white;
    }

    .room-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .room-header h4 {
      margin: 0;
      font-size: 1.1rem;
      color: var(--text);
    }

    .room-card.selected .room-header h4 {
      color: white;
    }

    .capacity-badge {
      background: var(--primary);
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .room-card.selected .capacity-badge {
      background: rgba(255, 255, 255, 0.2);
    }

    .room-details {
      margin-bottom: 1rem;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
      color: var(--text-light);
      font-size: 0.9rem;
    }

    .room-card.selected .detail-item {
      color: rgba(255, 255, 255, 0.8);
    }

    .icon {
      font-size: 1rem;
    }

    .btn-select {
      width: 100%;
      padding: 0.75rem;
      border: none;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      background: var(--primary);
      color: white;
      transition: background-color 0.2s;
    }

    .btn-select:disabled {
      background: var(--text-light);
      cursor: not-allowed;
    }

    .btn-select:hover:not(:disabled) {
      background: var(--primary-dark, #2563eb);
    }

    .room-card.selected .btn-select {
      background: rgba(255, 255, 255, 0.2);
      color: white;
    }

    .submit-section {
      background: var(--surface);
      border-radius: 12px;
      padding: 2rem;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      border: 1px solid var(--border);
    }

    .btn-request-approval {
      background: var(--primary);
      color: white;
      border: none;
      border-radius: 8px;
      padding: 1rem 2rem;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      margin-bottom: 1rem;
    }

    .btn-request-approval:hover:not(:disabled) {
      background: var(--primary-dark, #2563eb);
      transform: translateY(-1px);
    }

    .btn-request-approval:disabled {
      background: var(--text-light);
      cursor: not-allowed;
      transform: none;
    }

    .approval-note {
      color: var(--text-light);
      font-size: 0.9rem;
      margin: 0;
    }

    .error {
      background: #fee2e2;
      color: #991b1b;
      padding: 0.75rem;
      border-radius: 8px;
      margin-bottom: 1rem;
    }

    .success {
      background: #dcfce7;
      color: #166534;
      padding: 0.75rem;
      border-radius: 8px;
      margin-bottom: 1rem;
    }

    @media (max-width: 768px) {
      .container {
        padding: 1rem;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .input-row {
        grid-template-columns: 1fr;
      }

      .cards-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 480px) {
      .cards-grid {
        grid-template-columns: 1fr;
      }

      .room-card {
        padding: 1rem;
        min-height: 140px;
      }

      .room-header {
        flex-direction: column;
        align-items: center;
        text-align: center;
        margin-bottom: 0.75rem;
      }

      .room-header h4 {
        font-size: 1.1rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
      }

      .capacity-badge {
        font-size: 0.7rem;
        padding: 0.2rem 0.5rem;
      }

      .room-details {
        margin-bottom: 1rem;
      }

      .detail-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.8rem;
        margin-bottom: 0.5rem;
      }

      .btn-select {
        padding: 0.5rem;
        font-size: 0.8rem;
      }
    }
  `]
})
export class BookRoom implements OnInit {
  currentUser: User | null = null;
  availableDates: DateOption[] = [];
  selectedDateIndex = 0;
  meetingDate = '';
  startTime = '';
  endTime = '';
  
  meetingRequest: MeetingRequest = {
    roomId: 0,
    organizerId: 0,
    title: '',
    startTime: '',
    endTime: '',
    purpose: '',
    attendeeCount: 0,
    attendeeIds: [],
    attendeeNames: [],
    isEmergency: false,
    refreshmentRequests: ''
  };

  newAttendeeId = '';
  attendeeTags: AttendeeTag[] = [];
  rooms: MeetingRoom[] = [];
  filteredRooms: MeetingRoom[] = [];
  isLoading = false;
  error = '';
  success = '';
  activeRoleDropdown: number | null = null;
  showStickyHeader = false;


  holidays = {
    '01-01': 'New Year\'s Day',
    '01-26': 'Republic Day',
    '03-08': 'Holi',
    '03-29': 'Good Friday',
    '04-14': 'Ambedkar Jayanti',
    '05-01': 'Labour Day',
    '08-15': 'Independence Day',
    '08-19': 'Raksha Bandhan',
    '08-30': 'Janmashtami',
    '10-02': 'Gandhi Jayanti',
    '10-24': 'Dussehra',
    '11-12': 'Diwali',
    '11-13': 'Govardhan Puja',
    '12-25': 'Christmas Day'
  };

  constructor(
    private meetingRoomService: MeetingRoomService,
    private authService: AuthService,
    private toastService: ToastService,
    private bookingService: BookingService,
    private userService: UserService,
    private notificationService: NotificationService,
    private router: Router,
    private loaderService: LoaderService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.meetingRequest.organizerId = this.currentUser?.id || 0;
    this.generateAvailableDates();
    this.loadRooms();
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.showStickyHeader = scrollPosition > 200;
  }

  generateAvailableDates(): void {
    const today = new Date();
    let firstValidIndex = -1;
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const monthDay = `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
      const holidayName = this.holidays[monthDay as keyof typeof this.holidays];
      const isHoliday = !!holidayName;
      const isDisabled = isWeekend || isHoliday;
      
      this.availableDates.push({
        date: date,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        day: date.getDate(),
        monthName: date.toLocaleDateString('en-US', { month: 'short' }),
        dateString: date.toISOString().split('T')[0],
        isWeekend: isWeekend,
        isHoliday: isHoliday,
        holidayName: holidayName,
        isDisabled: isDisabled
      });
      
      if (firstValidIndex === -1 && !isDisabled) {
        firstValidIndex = i;
      }
    }
    
    this.selectedDateIndex = firstValidIndex >= 0 ? firstValidIndex : 0;
    this.meetingDate = this.availableDates[this.selectedDateIndex].dateString;
  }

  selectDate(index: number): void {
    if (this.availableDates[index].isDisabled) return;
    this.selectedDateIndex = index;
    this.meetingDate = this.availableDates[index].dateString;
    this.loadRooms();
  }

  onTimeChange(): void {
    if (this.startTime && this.endTime && this.startTime < this.endTime) {
      this.loadRooms();
    }
  }

  loadRooms(): void {
    if (this.meetingDate && this.startTime && this.endTime) {
      const startDateTime = `${this.meetingDate}T${this.startTime}:00`;
      const endDateTime = `${this.meetingDate}T${this.endTime}:00`;
      
      this.meetingRoomService.getAvailableRooms(startDateTime, endDateTime).subscribe({
        next: (rooms) => {
          this.rooms = rooms.map(room => ({ ...room, isAvailable: true }));
          this.filterRooms();
        },
        error: (error) => {
          console.error('Error loading available rooms:', error);
          this.loadAllRooms();
        }
      });
    } else {
      this.loadAllRooms();
    }
  }

  loadAllRooms(): void {
    this.meetingRoomService.getAllRooms().subscribe({
      next: (rooms) => {
        this.rooms = rooms;
        this.filterRooms();
      },
      error: (error) => {
        console.error('Error loading rooms:', error);
        this.rooms = [];
        this.filterRooms();
      }
    });
  }

  filterRooms(): void {
    if (this.meetingRequest.attendeeCount > 0) {
      const maxCapacity = this.meetingRequest.attendeeCount + 2;
      
      this.filteredRooms = this.rooms.filter(room => 
        room.capacity >= this.meetingRequest.attendeeCount && room.capacity <= maxCapacity
      );
    } else {
      this.filteredRooms = this.rooms;
    }
  }

  addAttendeeById(): void {
    const userId = parseInt(this.newAttendeeId);
    if (userId && !this.attendeeTags.some(a => a.id === userId)) {
      this.userService.getUserById(userId).subscribe({
        next: (user) => {
          this.attendeeTags.push({ id: user.id, name: user.userName, role: 'Participant' });
          this.meetingRequest.attendeeIds.push(user.id);
          this.meetingRequest.attendeeNames.push(user.userName);
          this.newAttendeeId = '';
          const message = userId === this.currentUser?.id ? 
            `${user.userName} added as attendee (no invitation will be sent to organizer)` :
            `${user.userName} added to meeting as Participant`;
          this.toastService.success('Attendee Added', message);
        },
        error: (error) => {
          this.toastService.error('User Not Found', `No user found with ID ${userId}`);
        }
      });
    } else if (this.attendeeTags.some(a => a.id === userId)) {
      this.toastService.warning('Duplicate User', 'This user is already added as an attendee');
    }
  }

  toggleRoleDropdown(index: number): void {
    this.activeRoleDropdown = this.activeRoleDropdown === index ? null : index;
  }

  selectRole(attendee: AttendeeTag, role: string, index: number): void {
    attendee.role = role;
    this.activeRoleDropdown = null;
    this.onRoleChange(attendee);
  }

  onRoleChange(attendee: AttendeeTag): void {
    // Role updated silently
  }

  removeAttendee(index: number): void {
    const removedAttendee = this.attendeeTags[index];
    this.attendeeTags.splice(index, 1);
    this.meetingRequest.attendeeIds.splice(index, 1);
    this.meetingRequest.attendeeNames.splice(index, 1);
    this.toastService.info('Attendee Removed', `${removedAttendee.name} removed from meeting`);
  }

  selectRoom(room: MeetingRoom): void {
    if (!room.isAvailable) {
      return;
    }
    
    if (!this.startTime || !this.endTime) {
      this.toastService.warning('Time Required', 'Please select start and end time first');
      return;
    }
    
    // Check room availability for selected time slot
    const startDateTime = `${this.meetingDate}T${this.startTime}:00`;
    const endDateTime = `${this.meetingDate}T${this.endTime}:00`;
    
    this.bookingService.checkRoomAvailability(startDateTime, endDateTime, room.id).subscribe({
      next: (result) => {
        if (result.isAvailable) {
          this.meetingRequest.roomId = room.id;
        } else {
          this.toastService.error('Room Conflict', `${room.roomName} is already booked for this time slot`);
        }
      },
      error: (error) => {
        console.error('Error checking availability:', error);
        this.toastService.error('Error', 'Failed to check room availability');
      }
    });
  }

  isFormValid(): boolean {
    return !!(this.meetingRequest.title && 
             this.startTime && 
             this.endTime && 
             this.meetingRequest.roomId &&
             this.startTime < this.endTime &&
             this.meetingRequest.attendeeCount > 0);
  }

  requestApproval(): void {
    if (!this.isFormValid()) {
      this.toastService.error('Validation Error', 'Please fill in all required fields including attendee count');
      return;
    }

    // Validate time logic
    if (this.startTime >= this.endTime) {
      this.toastService.error('Invalid Time', 'End time must be after start time');
      return;
    }

    // Check minimum meeting duration (15 minutes)
    const start = new Date(`${this.meetingDate}T${this.startTime}:00`);
    const end = new Date(`${this.meetingDate}T${this.endTime}:00`);
    const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    
    if (durationMinutes < 15) {
      this.toastService.error('Invalid Duration', 'Meeting must be at least 15 minutes long');
      return;
    }

    if (durationMinutes > 480) { // 8 hours
      this.toastService.error('Invalid Duration', 'Meeting cannot exceed 8 hours');
      return;
    }

    this.loaderService.show('Submitting meeting request...');
    this.error = '';
    this.success = '';

    const startDateTime = `${this.meetingDate}T${this.startTime}:00`;
    const endDateTime = `${this.meetingDate}T${this.endTime}:00`;
    
    const bookingRequest: BookingRequest = {
      roomId: this.meetingRequest.roomId,
      organizerId: this.meetingRequest.organizerId,
      title: this.meetingRequest.title,
      startTime: startDateTime,
      endTime: endDateTime,
      isEmergency: this.meetingRequest.isEmergency,
      attendeeUserIds: this.meetingRequest.attendeeIds,
      attendeeRoles: this.attendeeTags.map(tag => tag.role),
      refreshmentRequests: this.meetingRequest.refreshmentRequests
    };

    // Final availability check before submission
    this.bookingService.checkRoomAvailability(startDateTime, endDateTime, this.meetingRequest.roomId).subscribe({
      next: (availabilityResult) => {
        if (!availabilityResult.isAvailable) {
          this.toastService.error('Room Conflict', 'Selected room is no longer available for this time slot');
          this.loaderService.hide();
          return;
        }

        // Check for conflicts with attendees
        this.bookingService.checkConflicts(bookingRequest).subscribe({
          next: (conflictResult) => {
            if (conflictResult.hasConflicts) {
              this.toastService.warning('Attendee Conflicts', 
                `Some attendees have conflicting meetings: ${conflictResult.conflicts.join(', ')}`);
            }

            // Proceed with booking
            this.bookingService.createBookingRequest(bookingRequest).subscribe({
              next: (response) => {
                this.toastService.success(
                  'Request Submitted!', 
                  `Your meeting request "${this.meetingRequest.title}" has been submitted successfully.`
                );
                this.resetForm();
                this.isLoading = false;
                setTimeout(() => {
                  this.router.navigate(['/employee/my-bookings']);
                }, 1500);
              },
              error: (error) => {
                console.error('❌ Booking request failed:', error);
                this.error = error.error?.message || 'Failed to submit meeting request';
                this.isLoading = false;
              }
            });
          },
          error: (error) => {
            console.error('Error checking conflicts:', error);
            // Proceed anyway if conflict check fails
            this.bookingService.createBookingRequest(bookingRequest).subscribe({
              next: (response) => {
                this.toastService.success(
                  'Request Submitted!', 
                  `Your meeting request "${this.meetingRequest.title}" has been submitted successfully.`
                );
                this.resetForm();
                this.isLoading = false;
                setTimeout(() => {
                  this.router.navigate(['/employee/my-bookings']);
                }, 1500);
              },
              error: (error) => {
                console.error('❌ Booking request failed:', error);
                this.error = error.error?.message || 'Failed to submit meeting request';
                this.isLoading = false;
              }
            });
          }
        });
      },
      error: (error) => {
        console.error('Error checking availability:', error);
        this.toastService.error('Error', 'Failed to verify room availability');
        this.loaderService.hide();
      }
    });
  }

  resetForm(): void {
    this.meetingRequest = {
      roomId: 0,
      organizerId: this.currentUser?.id || 0,
      title: '',
      startTime: '',
      endTime: '',
      purpose: '',
      attendeeCount: 0,
      attendeeIds: [],
      attendeeNames: [],
      isEmergency: false,
      refreshmentRequests: ''
    };
    this.attendeeTags = [];
    this.newAttendeeId = '';
    this.startTime = '';
    this.endTime = '';
    this.selectedDateIndex = 0;
    this.meetingDate = this.availableDates[0].dateString;
    this.filterRooms();
  }
}