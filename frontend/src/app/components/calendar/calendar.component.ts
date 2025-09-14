import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService, BookingResponse } from '../../services/booking.service';
import { AuthService, User } from '../../services/auth.service';

interface Meeting {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected' | 'scheduled' | 'cancelled' | 'completed';
  attendees: string[];
  organizer: string;
}

interface CalendarDay {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  isHoliday: boolean;
  holidayName?: string;
  meetings: Meeting[];
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="calendar-container">
      <div class="calendar-header">
        <div class="month-navigation">
          <button class="nav-btn" (click)="previousMonth()">‹</button>
          <h2>{{ currentMonthYear }}</h2>
          <button class="nav-btn" (click)="nextMonth()">›</button>
        </div>
        <div class="view-toggle">
          <button class="toggle-btn" [class.active]="viewMode === 'month'" (click)="viewMode = 'month'">Month</button>
          <button class="toggle-btn" [class.active]="viewMode === 'week'" (click)="viewMode = 'week'">Week</button>
        </div>
      </div>

      <div class="calendar-grid" *ngIf="viewMode === 'month'">
        <div class="day-header" *ngFor="let day of weekDays">{{ day }}</div>
        <div *ngFor="let day of calendarDays" 
             class="calendar-day" 
             [class.other-month]="!day.isCurrentMonth"
             [class.today]="day.isToday"
             [class.weekend]="day.isWeekend"
             [class.holiday]="day.isHoliday"
             (click)="selectDay(day)">
          <div class="day-number">
            {{ day.day }}
            <span *ngIf="day.isHoliday" class="holiday-indicator" [title]="day.holidayName">🎉</span>
          </div>
          <div class="meetings-preview">
            <div *ngFor="let meeting of day.meetings.slice(0, 2)" 
                 class="meeting-dot" 
                 [class.pending]="meeting.status === 'pending'"
                 [class.approved]="meeting.status === 'approved'"
                 [class.scheduled]="meeting.status === 'scheduled'"
                 [class.completed]="meeting.status === 'completed'"
                 [class.cancelled]="meeting.status === 'cancelled'"
                 [title]="meeting.title + ' (' + meeting.startTime + ')'">
            </div>
            <div *ngIf="day.meetings.length > 2" class="more-meetings">
              +{{ day.meetings.length - 2 }}
            </div>
          </div>
        </div>
      </div>

      <div class="week-view" *ngIf="viewMode === 'week'">
        <div class="time-column">
          <div class="time-slot" *ngFor="let hour of timeSlots">{{ hour }}</div>
        </div>
        <div class="week-days">
          <div *ngFor="let day of weekDays" class="week-day-column">
            <div class="week-day-header">{{ day }}</div>
            <div class="time-slots">
              <div *ngFor="let hour of timeSlots" class="time-slot-cell">
                <!-- Meeting blocks would go here -->
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Day View Modal -->
      <div class="modal-overlay" *ngIf="showDayView" (click)="closeDayView()">
        <div class="day-view-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>
              {{ selectedDayForView?.date | date:'fullDate' }}
              <span *ngIf="selectedDayForView?.isHoliday" class="holiday-badge">
                🎉 {{ selectedDayForView?.holidayName }}
              </span>
              <span *ngIf="selectedDayForView?.isWeekend" class="weekend-badge">
                🏖️ Weekend
              </span>
            </h3>
            <button class="close-btn" (click)="closeDayView()">×</button>
          </div>
          <div class="day-schedule">
            <div class="schedule-header">
              <h4>Working Hours (9:00 AM - 5:00 PM)</h4>
            </div>
            <div class="time-slots-container">
              <div *ngFor="let hour of workingHours" class="time-slot-row">
                <div class="time-label">{{ hour }}</div>
                <div class="time-content">
                  <div *ngIf="getMeetingsForTimeSlot(hour).length === 0" class="empty-slot">
                    Available
                  </div>
                  <div *ngFor="let meeting of getMeetingsForTimeSlot(hour)" 
                       class="meeting-block" 
                       [class]="meeting.status">
                    <div class="meeting-title">{{ meeting.title }}</div>
                    <div class="meeting-time">{{ meeting.startTime }} - {{ meeting.endTime }}</div>
                    <div class="meeting-organizer">by {{ meeting.organizer }}</div>
                    <div class="meeting-attendees">{{ meeting.attendees.length }} attendees: {{ meeting.attendees.join(', ') }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Meeting Details Modal -->
      <div class="modal-overlay" *ngIf="selectedDay && !showDayView" (click)="closeModal()">
        <div class="modal-card" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Meetings for {{ selectedDay.date | date:'fullDate' }}</h3>
            <button class="close-btn" (click)="closeModal()">×</button>
          </div>
          <div class="modal-body">
            <div *ngIf="selectedDay.meetings.length === 0" class="no-meetings">
              No meetings scheduled for this day
            </div>
            <div *ngFor="let meeting of selectedDay.meetings" class="meeting-item">
              <div class="meeting-header">
                <h4>{{ meeting.title }}</h4>
                <span class="status-badge" [class]="meeting.status">{{ meeting.status }}</span>
              </div>
              <div class="meeting-details">
                <div class="meeting-time">
                  <span class="icon">🕐</span>
                  {{ meeting.startTime }} - {{ meeting.endTime }}
                </div>
                <div class="meeting-organizer">
                  <span class="icon">👤</span>
                  Organized by: {{ meeting.organizer }}
                </div>
                <div class="meeting-attendees">
                  <span class="icon">👥</span>
                  {{ meeting.attendees.length }} attendees: {{ meeting.attendees.join(', ') }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .calendar-container {
      background: var(--surface);
      border-radius: 12px;
      padding: 2rem;
      box-shadow: var(--shadow, 0 2px 8px rgba(0,0,0,0.1));
      border: 1px solid var(--border);
    }

    .calendar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .month-navigation {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .nav-btn {
      background: var(--background);
      border: 1px solid var(--border);
      border-radius: 50%;
      width: 40px;
      height: 40px;
      cursor: pointer;
      font-size: 1.2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text);
      transition: all 0.2s ease;
    }

    .nav-btn:hover {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
    }

    .month-navigation h2 {
      margin: 0;
      font-size: 1.5rem;
      color: var(--text);
    }

    .view-toggle {
      display: flex;
      gap: 0.5rem;
    }

    .toggle-btn {
      padding: 0.5rem 1rem;
      border: 1px solid var(--border);
      background: var(--background);
      border-radius: 6px;
      cursor: pointer;
      color: var(--text);
      transition: all 0.2s ease;
    }

    .toggle-btn:hover {
      background: var(--surface);
    }

    .toggle-btn.active {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
    }

    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 1px;
      background: var(--border);
      border-radius: 8px;
      overflow: hidden;
    }

    .day-header {
      background: var(--background);
      padding: 1rem;
      text-align: center;
      font-weight: 600;
      color: var(--text);
    }

    .day-header:first-child,
    .day-header:last-child {
      background: var(--weekend-header-bg, rgba(255, 193, 7, 0.2));
      color: var(--weekend-text, #856404);
    }

    .calendar-day {
      background: var(--surface);
      min-height: 120px;
      padding: 0.5rem;
      cursor: pointer;
      transition: background-color 0.2s;
      color: var(--text);
    }

    .calendar-day:hover {
      background: var(--background);
    }

    .calendar-day.today {
      background: var(--primary-light, rgba(59, 130, 246, 0.1));
      border: 2px solid var(--primary);
    }

    .calendar-day.weekend {
      background: var(--weekend-bg, rgba(255, 193, 7, 0.1));
      border-left: 3px solid var(--weekend-border, #ffc107);
    }

    .calendar-day.holiday {
      background: var(--holiday-bg, rgba(220, 53, 69, 0.1));
      border-left: 3px solid var(--holiday-border, #dc3545);
    }

    .calendar-day.other-month {
      background: var(--background);
      color: var(--text-light);
      opacity: 0.6;
    }

    .holiday-indicator {
      font-size: 0.8rem;
      margin-left: 0.25rem;
    }

    .day-number {
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .meetings-preview {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .meeting-dot {
      height: 4px;
      border-radius: 2px;
      margin-bottom: 2px;
    }

    .meeting-dot.pending {
      background: var(--warning, #f59e0b);
    }

    .meeting-dot.approved {
      background: var(--info, #3b82f6);
    }

    .meeting-dot.scheduled {
      background: var(--success, #10b981);
    }

    .meeting-dot.completed {
      background: var(--text-light, #6b7280);
    }

    .meeting-dot.cancelled {
      background: var(--error, #ef4444);
    }

    .more-meetings {
      font-size: 0.75rem;
      color: var(--text-light);
      margin-top: 2px;
    }

    .week-view {
      display: flex;
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
    }

    .time-column {
      width: 80px;
      background: var(--background);
      border-right: 1px solid var(--border);
    }

    .time-slot {
      height: 60px;
      padding: 0.5rem;
      border-bottom: 1px solid var(--border);
      font-size: 0.75rem;
      color: var(--text-light);
      display: flex;
      align-items: center;
    }

    .week-days {
      display: flex;
      flex: 1;
    }

    .week-day-column {
      flex: 1;
      border-right: 1px solid var(--border);
    }

    .week-day-column:last-child {
      border-right: none;
    }

    .week-day-header {
      padding: 1rem;
      text-align: center;
      font-weight: 600;
      background: var(--background);
      border-bottom: 1px solid var(--border);
      color: var(--text);
    }

    .time-slots {
      display: flex;
      flex-direction: column;
    }

    .time-slot-cell {
      height: 60px;
      border-bottom: 1px solid var(--border);
      background: var(--surface);
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
      max-width: 600px;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: var(--shadow, 0 10px 25px rgba(0, 0, 0, 0.2));
      border: 1px solid var(--border);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .modal-header h3 {
      margin: 0;
      color: var(--text);
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: var(--text-light);
      transition: color 0.2s ease;
    }

    .close-btn:hover {
      color: var(--error, #ef4444);
    }

    .no-meetings {
      text-align: center;
      color: var(--text-light);
      padding: 2rem;
    }

    .meeting-item {
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1rem;
      background: var(--background);
    }

    .meeting-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .meeting-header h4 {
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

    .status-badge.pending {
      background: var(--warning-light, #fef3c7);
      color: var(--warning-dark, #92400e);
    }

    .status-badge.approved {
      background: rgba(59, 130, 246, 0.1);
      color: #1e40af;
    }

    .status-badge.scheduled {
      background: var(--success-light, #d1fae5);
      color: var(--success-dark, #065f46);
    }

    .status-badge.completed {
      background: rgba(107, 114, 128, 0.1);
      color: #374151;
    }

    .status-badge.cancelled {
      background: var(--error-light, #fee2e2);
      color: var(--error-dark, #991b1b);
    }

    .meeting-details {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .meeting-time, .meeting-organizer, .meeting-attendees {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      color: var(--text-light);
    }

    .icon {
      font-size: 1rem;
    }

    .day-view-modal {
      background: var(--surface);
      border-radius: 12px;
      padding: 2rem;
      width: 90%;
      max-width: 800px;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: var(--shadow, 0 10px 25px rgba(0, 0, 0, 0.2));
      border: 1px solid var(--border);
    }

    .holiday-badge, .weekend-badge {
      background: var(--error-light, #fee2e2);
      color: var(--error-dark, #991b1b);
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.8rem;
      margin-left: 0.5rem;
    }

    .weekend-badge {
      background: var(--warning-light, #fef3c7);
      color: var(--warning-dark, #92400e);
    }

    .day-schedule {
      margin-top: 1rem;
    }

    .schedule-header h4 {
      margin: 0 0 1rem 0;
      color: var(--text);
      border-bottom: 2px solid var(--border);
      padding-bottom: 0.5rem;
    }

    .time-slots-container {
      display: flex;
      flex-direction: column;
      gap: 1px;
      background: var(--border);
      border-radius: 8px;
      overflow: hidden;
    }

    .time-slot-row {
      display: flex;
      background: var(--surface);
      min-height: 60px;
    }

    .time-label {
      width: 80px;
      padding: 1rem;
      background: var(--background);
      border-right: 1px solid var(--border);
      font-weight: 600;
      color: var(--text);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .time-content {
      flex: 1;
      padding: 0.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .empty-slot {
      color: var(--text-light);
      font-style: italic;
      padding: 0.5rem;
      text-align: center;
    }

    .meeting-block {
      background: var(--background);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 0.75rem;
      border-left: 4px solid var(--primary);
    }

    .meeting-block.pending {
      border-left-color: var(--warning, #f59e0b);
      background: var(--warning-light, rgba(245, 158, 11, 0.1));
    }

    .meeting-block.approved {
      border-left-color: var(--info, #3b82f6);
      background: rgba(59, 130, 246, 0.1);
    }

    .meeting-block.scheduled {
      border-left-color: var(--success, #10b981);
      background: var(--success-light, rgba(16, 185, 129, 0.1));
    }

    .meeting-block.completed {
      border-left-color: var(--text-light, #6b7280);
      background: rgba(107, 114, 128, 0.1);
    }

    .meeting-block.cancelled {
      border-left-color: var(--error, #ef4444);
      background: var(--error-light, rgba(239, 68, 68, 0.1));
    }

    .meeting-title {
      font-weight: 600;
      color: var(--text);
      margin-bottom: 0.25rem;
    }

    .meeting-time {
      font-size: 0.9rem;
      color: var(--text-light);
      margin-bottom: 0.25rem;
    }

    .meeting-organizer {
      font-size: 0.8rem;
      color: var(--text-light);
    }

    .meeting-attendees {
      font-size: 0.8rem;
      color: var(--text-light);
      word-wrap: break-word;
    }

    @media (max-width: 768px) {
      .calendar-container {
        padding: 1rem;
      }

      .calendar-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .month-navigation {
        justify-content: center;
      }

      .view-toggle {
        justify-content: center;
      }

      .calendar-day {
        min-height: 80px;
        padding: 0.25rem;
      }

      .modal-card {
        padding: 1rem;
        width: 95%;
      }

      .week-view {
        overflow-x: auto;
      }

      .time-column {
        width: 60px;
      }

      .week-day-column {
        min-width: 120px;
      }

      .day-view-modal {
        width: 95%;
        padding: 1rem;
      }

      .time-slot-row {
        flex-direction: column;
      }

      .time-label {
        width: 100%;
        border-right: none;
        border-bottom: 1px solid var(--border);
      }
    }
  `]
})
export class CalendarComponent implements OnInit {
  currentDate = new Date();
  currentMonthYear = '';
  viewMode: 'month' | 'week' = 'month';
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  timeSlots = Array.from({length: 24}, (_, i) => `${i.toString().padStart(2, '0')}:00`);
  calendarDays: CalendarDay[] = [];
  selectedDay: CalendarDay | null = null;

  // Indian Government holidays (format: MM-DD)
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

  workingHours = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  showDayView = false;
  selectedDayForView: CalendarDay | null = null;

  meetings: Meeting[] = [];
  currentUser: User | null = null;

  constructor(
    private bookingService: BookingService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.updateCalendar();
    this.loadBookings();
  }

  loadBookings(): void {
    if (this.currentUser) {
      this.bookingService.getAllBookings().subscribe({
        next: (bookings) => {
          this.meetings = bookings
            .filter(booking => {
              // Show meetings where user is organizer or attendee
              const isOrganizer = booking.organizerId === this.currentUser!.id;
              const isAttendee = booking.attendees.some(attendee => attendee.userId === this.currentUser!.id);
              const isVisible = ['Pending', 'Approved', 'Scheduled', 'Completed'].includes(booking.status);
              return (isOrganizer || isAttendee) && isVisible;
            })
            .map(booking => this.convertBookingToMeeting(booking));
          this.generateCalendarDays();
        },
        error: (error) => {
          console.error('Error loading bookings:', error);
        }
      });
    }
  }

  convertBookingToMeeting(booking: BookingResponse): Meeting {
    const startDate = new Date(booking.startTime);
    const endDate = new Date(booking.endTime);
    
    // Subtract one day to fix date display issue
    const correctedDate = new Date(startDate);
    correctedDate.setDate(correctedDate.getDate() - 1);
    
    return {
      id: booking.bookingId,
      title: booking.title,
      startTime: startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      endTime: endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      date: correctedDate.toISOString().split('T')[0],
      status: this.mapBookingStatus(booking.status),
      attendees: booking.attendees.map(a => a.userName),
      organizer: booking.organizerName
    };
  }

  updateCalendar() {
    this.currentMonthYear = this.currentDate.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
    this.generateCalendarDays();
  }

  generateCalendarDays() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    this.calendarDays = [];
    const today = new Date();

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dateStr = date.toISOString().split('T')[0];
      const dayMeetings = this.meetings.filter(meeting => meeting.date === dateStr);

      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const monthDay = `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
      const holidayName = this.holidays[monthDay as keyof typeof this.holidays];

      this.calendarDays.push({
        date: date,
        day: date.getDate(),
        isCurrentMonth: date.getMonth() === month,
        isToday: date.toDateString() === today.toDateString(),
        isWeekend: isWeekend,
        isHoliday: !!holidayName,
        holidayName: holidayName,
        meetings: dayMeetings
      });
    }
  }

  previousMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.updateCalendar();
  }

  nextMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.updateCalendar();
  }

  selectDay(day: CalendarDay) {
    this.selectedDay = day;
    this.selectedDayForView = day;
    this.showDayView = true;
  }

  closeDayView() {
    this.showDayView = false;
    this.selectedDayForView = null;
  }

  getMeetingsForTimeSlot(hour: string): Meeting[] {
    if (!this.selectedDayForView) return [];
    const dateStr = this.selectedDayForView.date.toISOString().split('T')[0];
    return this.meetings.filter(meeting => {
      if (meeting.date !== dateStr) return false;
      const meetingStart = parseInt(meeting.startTime.split(':')[0]);
      const slotHour = parseInt(hour.split(':')[0]);
      return meetingStart === slotHour;
    });
  }

  closeModal() {
    this.selectedDay = null;
  }

  mapBookingStatus(status: string): 'pending' | 'approved' | 'rejected' | 'scheduled' | 'cancelled' | 'completed' {
    switch (status) {
      case 'Pending': return 'pending';
      case 'Approved': return 'approved';
      case 'Rejected': return 'rejected';
      case 'Scheduled': return 'scheduled';
      case 'Cancelled': return 'cancelled';
      case 'Completed': return 'completed';
      default: return 'pending';
    }
  }
}