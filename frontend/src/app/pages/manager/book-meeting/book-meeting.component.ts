import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MeetingRoomService, MeetingRoom } from '../../../services/meetingroom.service';
import { UserService } from '../../../services/user.service';
import { ToastService } from '../../../services/toast.service';
import { BookingService, BookingRequest } from '../../../services/booking.service';
import { AuthService, User } from '../../../services/auth.service';

interface AttendeeTag {
  id: number;
  name: string;
  role: string;
}

interface SearchResult {
  id: number;
  userName: string;
  email: string;
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

@Component({
  selector: 'app-book-meeting',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="page-header">
        <h1><i class="pi pi-calendar"></i> Book Meeting</h1>
        <p>Schedule a meeting and invite attendees</p>
      </div>

      <div class="booking-form">
        <div class="form-section">
          <h3>Select Date</h3>
          <div class="date-selector">
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
          
          <h3>Meeting Details</h3>
          <div class="form-row">
            <div class="form-group">
              <label>Start Time</label>
              <input type="time" [(ngModel)]="startTime" class="form-input" required>
            </div>
            <div class="form-group">
              <label>End Time</label>
              <input type="time" [(ngModel)]="endTime" class="form-input" required>
            </div>
          </div>
          <div class="form-group">
            <label>Total People in Meeting</label>
            <input type="number" [(ngModel)]="meetingCount" (ngModelChange)="filterRooms()" 
                   class="form-input" min="1" placeholder="Enter total number of people">
          </div>
          <div class="form-group">
            <label>Meeting Title</label>
            <input type="text" [(ngModel)]="meetingTitle" class="form-input" placeholder="Enter meeting title" required>
          </div>
          <div class="form-group">
            <label>Meeting Purpose</label>
            <input type="text" [(ngModel)]="meetingPurpose" class="form-input" placeholder="Enter meeting purpose">
          </div>
          <div class="form-group">
            <label>Refreshment Requests (Optional)</label>
            <textarea [(ngModel)]="refreshmentRequests" 
                      class="form-input" 
                      placeholder="Any special refreshment requirements..." 
                      rows="3"></textarea>
          </div>
          

        </div>

        <div class="form-section">
          <h3>Attendee Information ({{ attendeeTags.length }} attendees)</h3>
          <div class="attendee-input-section">
            <div class="search-section">
              <div class="search-box">
                <input type="text" [(ngModel)]="searchTerm" (input)="searchUsers()" 
                       placeholder="Search users by name or email..." class="form-input search-input">
                <i class="pi pi-search search-icon"></i>
              </div>
              
              <div class="search-results" *ngIf="searchResults.length > 0 && searchTerm">
                <div *ngFor="let user of searchResults" class="search-result-item" (click)="addAttendeeFromSearch(user)">
                  <div class="user-info">
                    <span class="user-name">{{ user.userName }}</span>
                    <span class="user-email">{{ user.email }}</span>
                  </div>
                  <span class="user-id">ID: {{ user.id }}</span>
                </div>
              </div>
            </div>
            
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

      <div class="rooms-section" *ngIf="meetingCount > 0">
        <h3>Available Rooms ({{ filteredRooms.length }})</h3>
        <div class="cards-grid">
          <div 
            *ngFor="let room of filteredRooms" 
            class="room-card"
            [class.available]="room.isAvailable"
            [class.booked]="!room.isAvailable"
            [class.selected]="selectedRoomId === room.id"
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
                {{ room.isAvailable ? (selectedRoomId === room.id ? 'Selected' : 'Select Room') : 'Not Available' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="submit-section" *ngIf="selectedRoomId > 0">
        <div class="error" *ngIf="error">{{ error }}</div>
        <div class="success" *ngIf="success">{{ success }}</div>
        
        <button class="btn-book-meeting" (click)="bookMeeting()" [disabled]="isLoading || !isFormValid()">
          <span *ngIf="isLoading">Booking Meeting...</span>
          <span *ngIf="!isLoading"><i class="pi pi-calendar-plus"></i> Book Meeting</span>
        </button>
        
        <p class="booking-note">
          Meeting will be booked immediately and attendees will be notified.
        </p>
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

    .date-selector {
      margin-bottom: 2rem;
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

    .attendee-input-section {
      margin-bottom: 1.5rem;
    }

    .search-section {
      margin-bottom: 1rem;
    }

    .search-box {
      position: relative;
      margin-bottom: 0.5rem;
    }

    .search-input {
      padding-right: 2.5rem;
    }

    .search-icon {
      position: absolute;
      right: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-light);
      pointer-events: none;
    }

    .search-results {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 6px;
      max-height: 200px;
      overflow-y: auto;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      z-index: 10;
    }

    .search-result-item {
      padding: 0.75rem;
      border-bottom: 1px solid var(--border);
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: background-color 0.2s;
    }

    .search-result-item:hover {
      background: var(--primary-light, rgba(59, 130, 246, 0.1));
    }

    .search-result-item:last-child {
      border-bottom: none;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .user-name {
      font-weight: 500;
      color: var(--text);
    }

    .user-email {
      font-size: 0.875rem;
      color: var(--text-light);
    }

    .user-id {
      font-size: 0.875rem;
      color: var(--text-light);
      font-weight: 500;
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

    .rooms-section h3 {
      margin-bottom: 1.5rem;
      color: var(--text);
    }

    .cards-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
    }

    @media (max-width: 1199px) and (min-width: 768px) {
      .cards-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 767px) {
      .cards-grid {
        grid-template-columns: 1fr;
      }
    }

    .room-card {
      background: var(--surface);
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      border: 2px solid var(--border);
      transition: all 0.3s ease;
    }

    .room-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .room-card.available {
      border-color: var(--success, #10b981);
      background: var(--surface);
    }

    .room-card.booked {
      border-color: var(--error, #ef4444);
      background: var(--surface);
      opacity: 0.7;
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

    .capacity-badge {
      background: var(--primary);
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 500;
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

    .icon {
      font-size: 1rem;
    }

    .room-card.selected {
      border-color: var(--primary);
      background: var(--primary);
      color: white;
    }

    .room-card.selected .room-header h4 {
      color: white;
    }

    .room-card.selected .capacity-badge {
      background: rgba(255, 255, 255, 0.2);
    }

    .room-card.selected .detail-item {
      color: rgba(255, 255, 255, 0.8);
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

    .btn-book-meeting {
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

    .btn-book-meeting:hover:not(:disabled) {
      background: var(--primary-dark, #2563eb);
      transform: translateY(-1px);
    }

    .btn-book-meeting:disabled {
      background: var(--text-light);
      cursor: not-allowed;
      transform: none;
    }

    .booking-note {
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
  `]
})
export class BookMeetingComponent implements OnInit {
  currentUser: User | null = null;
  availableDates: DateOption[] = [];
  selectedDateIndex = 0;
  meetingDate = '';
  startTime = '';
  endTime = '';
  meetingTitle = '';
  meetingPurpose = '';
  meetingCount = 0;
  attendeeTags: AttendeeTag[] = [];
  newAttendeeId = '';
  searchTerm = '';
  searchResults: SearchResult[] = [];
  allUsers: SearchResult[] = [];
  rooms: MeetingRoom[] = [];
  filteredRooms: MeetingRoom[] = [];
  refreshmentRequests = '';
  isLoading = false;
  selectedRoomId = 0;
  error = '';
  success = '';
  activeRoleDropdown: number | null = null;


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
    private userService: UserService,
    private toastService: ToastService,
    private bookingService: BookingService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.generateAvailableDates();
    this.loadRooms();
    this.loadAllUsers();
  }

  loadAllUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.allUsers = users.map(user => ({
          id: user.id,
          userName: user.userName,
          email: user.email
        }));
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
  }

  searchUsers(): void {
    if (!this.searchTerm.trim()) {
      this.searchResults = [];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.searchResults = this.allUsers
      .filter(user => 
        user.userName.toLowerCase().includes(term) || 
        user.email.toLowerCase().includes(term)
      )
      .filter(user => !this.attendeeTags.some(attendee => attendee.id === user.id))
      .slice(0, 5); // Limit to 5 results
  }

  addAttendeeFromSearch(user: SearchResult): void {
    if (!this.attendeeTags.some(a => a.id === user.id)) {
      this.attendeeTags.push({ id: user.id, name: user.userName, role: 'Participant' });
      this.toastService.success('Attendee Added', `${user.userName} added to meeting`);
      this.searchTerm = '';
      this.searchResults = [];
    }
  }



  generateAvailableDates() {
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

  selectDate(index: number) {
    if (this.availableDates[index].isDisabled) return;
    this.selectedDateIndex = index;
    this.meetingDate = this.availableDates[index].dateString;
  }

  loadRooms() {
    this.meetingRoomService.getAllRooms().subscribe({
      next: (rooms) => {
        this.rooms = rooms;
        this.filterRooms();
      },
      error: (error) => {
        console.error('Error loading rooms:', error);
        // Mock data for testing
        this.rooms = [
          { id: 1, roomName: 'Conference Room A', capacity: 10, amenities: 'Projector, Whiteboard', isAvailable: true },
          { id: 2, roomName: 'Meeting Room B', capacity: 6, amenities: 'TV Screen, Phone', isAvailable: false },
          { id: 3, roomName: 'Board Room', capacity: 12, amenities: 'Video Conference, Projector', isAvailable: true },
          { id: 4, roomName: 'Small Room', capacity: 4, amenities: 'Basic Setup', isAvailable: true }
        ];
        this.filterRooms();
      }
    });
  }

  filterRooms() {
    if (this.meetingCount > 0) {
      const maxCapacity = this.meetingCount + 2;
      
      this.filteredRooms = this.rooms.filter(room => 
        room.capacity >= this.meetingCount && room.capacity <= maxCapacity
      );
    } else {
      this.filteredRooms = [];
    }
  }

  addAttendeeById() {
    const userId = parseInt(this.newAttendeeId);
    if (userId && !this.attendeeTags.some(a => a.id === userId)) {
      this.userService.getUserById(userId).subscribe({
        next: (user) => {
          this.attendeeTags.push({ id: user.id, name: user.userName, role: 'Participant' });
          this.newAttendeeId = '';
          this.toastService.success('Attendee Added', `${user.userName} added to meeting`);
        },
        error: (error) => {
          this.toastService.error('User Not Found', `No user found with ID ${userId}`);
        }
      });
    } else if (this.attendeeTags.some(a => a.id === userId)) {
      this.toastService.warning('Duplicate User', 'This user is already added as an attendee');
    }
  }

  removeAttendee(index: number) {
    const removedAttendee = this.attendeeTags[index];
    this.attendeeTags.splice(index, 1);
    this.toastService.info('Attendee Removed', `${removedAttendee.name} removed from meeting`);
  }

  selectRoom(room: MeetingRoom): void {
    if (room.isAvailable) {
      this.selectedRoomId = room.id;
    }
  }

  bookMeeting(): void {
    if (!this.isFormValid()) {
      this.toastService.error('Validation Error', 'Please fill in all required fields');
      return;
    }

    this.isLoading = true;
    this.error = '';
    this.success = '';

    const startDateTime = `${this.meetingDate}T${this.startTime}:00`;
    const endDateTime = `${this.meetingDate}T${this.endTime}:00`;
    
    const bookingRequest: BookingRequest = {
      roomId: this.selectedRoomId,
      organizerId: this.currentUser?.id || 0,
      title: this.meetingTitle,
      startTime: startDateTime,
      endTime: endDateTime,
      isEmergency: false,
      attendeeUserIds: this.attendeeTags.map(a => a.id),
      attendeeRoles: this.attendeeTags.map(a => a.role),
      refreshmentRequests: this.refreshmentRequests
    };

    this.bookingService.createBooking(bookingRequest).subscribe({
      next: (response) => {
        this.toastService.success(
          'Meeting Booked!', 
          `Meeting "${this.meetingTitle}" has been booked successfully.`
        );
        this.resetForm();
        this.isLoading = false;
        setTimeout(() => {
          this.router.navigate(['/manager/home']);
        }, 1500);
      },
      error: (error) => {
        console.error('Booking error:', error);
        this.error = error.error?.message || 'Failed to book meeting';
        this.isLoading = false;
      }
    });
  }

  isFormValid(): boolean {
    return !!(this.meetingTitle && 
             this.startTime && 
             this.endTime && 
             this.startTime < this.endTime);
  }

  toggleRoleDropdown(index: number): void {
    this.activeRoleDropdown = this.activeRoleDropdown === index ? null : index;
  }

  selectRole(attendee: AttendeeTag, role: string, index: number): void {
    attendee.role = role;
    this.activeRoleDropdown = null;
  }

  resetForm(): void {
    this.meetingDate = this.availableDates[0].dateString;
    this.selectedDateIndex = 0;
    this.startTime = '';
    this.endTime = '';
    this.meetingTitle = '';
    this.meetingPurpose = '';
    this.meetingCount = 0;
    this.attendeeTags = [];
    this.newAttendeeId = '';
    this.refreshmentRequests = '';
    this.selectedRoomId = 0;
    this.filteredRooms = [];
  }
}