import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

export interface RoomUtilization {
  roomId: number;
  roomName: string;
  totalBookings: number;
  utilizationRate: number;
  avgDuration: number;
}

export interface BookingStats {
  daily: { date: string; count: number }[];
  weekly: { week: string; count: number }[];
  monthly: { month: string; count: number }[];
}

export interface PeakHours {
  hour: number;
  bookingCount: number;
}

export interface UtilizationReport {
  roomUtilization: RoomUtilization[];
  bookingStats: BookingStats;
  peakHours: PeakHours[];
  totalMeetings: number;
  avgMeetingDuration: number;
  mostBookedRoom: string;
  leastBookedRoom: string;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private readonly API_URL = 'https://localhost:7273/api/Analytics';

  constructor(private http: HttpClient) {}

  getUtilizationReport(period: 'daily' | 'weekly' | 'monthly' = 'monthly'): Observable<UtilizationReport> {
    // Mock data for now - replace with actual API call
    return of({
      roomUtilization: [
        { roomId: 1, roomName: 'Conference Room A', totalBookings: 45, utilizationRate: 85, avgDuration: 90 },
        { roomId: 2, roomName: 'Meeting Room B', totalBookings: 32, utilizationRate: 65, avgDuration: 75 },
        { roomId: 3, roomName: 'Board Room', totalBookings: 28, utilizationRate: 55, avgDuration: 120 },
        { roomId: 4, roomName: 'Small Room', totalBookings: 15, utilizationRate: 30, avgDuration: 60 }
      ],
      bookingStats: {
        daily: Array.from({length: 7}, (_, i) => ({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          count: Math.floor(Math.random() * 20) + 5
        })).reverse(),
        weekly: Array.from({length: 4}, (_, i) => ({
          week: `Week ${i + 1}`,
          count: Math.floor(Math.random() * 100) + 50
        })),
        monthly: Array.from({length: 6}, (_, i) => ({
          month: new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'short' }),
          count: Math.floor(Math.random() * 200) + 100
        }))
      },
      peakHours: Array.from({length: 24}, (_, i) => ({
        hour: i,
        bookingCount: i >= 9 && i <= 17 ? Math.floor(Math.random() * 15) + 5 : Math.floor(Math.random() * 3)
      })),
      totalMeetings: 120,
      avgMeetingDuration: 85,
      mostBookedRoom: 'Conference Room A',
      leastBookedRoom: 'Small Room'
    });
  }

  exportReport(format: 'csv' | 'pdf', period: string): Observable<Blob> {
    // Mock export - replace with actual API call
    const data = format === 'csv' ? 
      'Room,Bookings,Utilization\nConference Room A,45,85%\nMeeting Room B,32,65%' :
      new Blob(['PDF Report Content'], { type: 'application/pdf' });
    
    return of(new Blob([data], { 
      type: format === 'csv' ? 'text/csv' : 'application/pdf' 
    }));
  }
}