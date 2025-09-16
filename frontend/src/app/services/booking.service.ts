import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BookingResponse {
  bookingId: string;
  roomId: number;
  roomName: string;
  organizerId: number;
  organizerName: string;
  title: string;
  startTime: string;
  endTime: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Scheduled' | 'Cancelled' | 'Completed';
  isEmergency: boolean;
  createdAt: string;
  attendees: AttendeeResponse[];
  approvalStatus?: 'Pending' | 'Approved' | 'Rejected';
  suggestedRoomId?: number;
  suggestedRoomName?: string;
  teamsEventId?: string;
  teamsJoinUrl?: string;
}

export interface AttendeeResponse {
  attendeeId: number;
  userId: number;
  userName: string;
  status: string;
  roleInMeeting: string;
}

export interface BookingRequest {
  roomId: number;
  organizerId: number;
  title: string;
  startTime: string;
  endTime: string;
  isEmergency: boolean;
  attendeeUserIds: number[];
  attendeeRoles?: string[];
  refreshmentRequests?: string;
}

export interface MeetingRoomResponse {
  id: number;
  roomName: string;
  capacity: number;
  amenities: string;
  isAvailable: boolean;
  priorityLevel: string;
}

export interface MeetingRoom {
  roomId: number;
  roomName: string;
  capacity: number;
  amenities: string;
  isAvailable: boolean;
  priorityLevel: string;
}

export interface Booking {
  bookingId: string;
  roomId: number;
  roomName: string;
  organizerId: number;
  organizerName: string;
  title: string;
  startTime: string;
  endTime: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Scheduled' | 'Cancelled' | 'Completed';
  approvalStatus?: string;
  isEmergency: boolean;
  createdAt: string;
  attendees: AttendeeResponse[];
  rejectionComment?: string;
  teamsEventId?: string;
  teamsJoinUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private readonly API_URL = 'https://localhost:7273/api';

  constructor(private http: HttpClient) {}

  getAllBookings(): Observable<BookingResponse[]> {
    return this.http.get<BookingResponse[]>(`${this.API_URL}/Booking`);
  }

  getBookingsByUser(userId: number): Observable<BookingResponse[]> {
    return this.http.get<BookingResponse[]>(`${this.API_URL}/Booking/user/${userId}`);
  }

  getBookingsByRoom(roomId: number): Observable<BookingResponse[]> {
    return this.http.get<BookingResponse[]>(`${this.API_URL}/Booking/room/${roomId}`);
  }

  createBooking(booking: BookingRequest): Observable<BookingResponse> {
    return this.http.post<BookingResponse>(`${this.API_URL}/Booking`, booking);
  }

  createBookingRequest(booking: BookingRequest): Observable<BookingResponse> {
    return this.http.post<BookingResponse>(`${this.API_URL}/Booking`, booking);
  }

  approveBookingRequest(requestId: string, approvedRoomId?: number): Observable<BookingResponse> {
    return this.http.post<BookingResponse>(`${this.API_URL}/Booking/approve/${requestId}`, {
      approvedRoomId: approvedRoomId
    });
  }

  rejectBookingRequest(requestId: string, reason?: string): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/Booking/reject/${requestId}`, {
      reason: reason
    });
  }

  updateBooking(id: string, booking: BookingRequest): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/Booking/${id}`, booking);
  }

  deleteBooking(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/Booking/${id}`);
  }

  // Uses query params instead of roomId in path
  checkRoomAvailability(startTime: string, endTime: string, roomId?: number): 
    Observable<{ isAvailable: boolean }> {
    let url = `${this.API_URL}/Booking/availability?startTime=${startTime}&endTime=${endTime}`;
    if (roomId) {
      url += `&roomId=${roomId}`;
    }
    return this.http.get<{ isAvailable: boolean }>(url);
  }

  checkConflicts(booking: BookingRequest): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/Booking/check-conflicts`, booking);
  }

  getAllRooms(): Observable<MeetingRoomResponse[]> {
    return this.http.get<MeetingRoomResponse[]>(`${this.API_URL}/MeetingRoom`);
  }

  endMeetingEarly(bookingId: string): Observable<BookingResponse> {
    return this.http.put<BookingResponse>(`${this.API_URL}/Booking/${bookingId}/end`, {});
  }

  extendMeeting(bookingId: string, newEndTime: string): Observable<BookingResponse> {
    return this.http.put<BookingResponse>(`${this.API_URL}/Booking/${bookingId}/extend`, { newEndTime });
  }

  cancelBooking(bookingId: string): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/Booking/${bookingId}/cancel`, {});
  }


}
