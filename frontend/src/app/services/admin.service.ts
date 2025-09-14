import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface MeetingRoom {
  id: number;
  roomName: string;
  capacity: number;
  amenities: string;
  isAvailable: boolean;
}

export interface User {
  id: number;
  userName: string;
  email: string;
  department: string;
  roles: string[];
  managerId?: number;
}

export type UpdateEmployeePayload = {
  department?: string;
  managerId?: number;
  role?: 'Employee' | 'Manager' | 'Admin';
  preferences?: string | null;
};

export interface Booking {
  bookingId: string;
  roomId: number;
  roomName: string;
  userId: number;
  userName: string;
  startTime: string;
  endTime: string;
  purpose: string;
  status: string;
  isEmergency: boolean;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly API_URL = 'https://localhost:7273/api';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  // Meeting Rooms
  getAllRooms(): Observable<MeetingRoom[]> {
    return this.http.get<MeetingRoom[]>(`${this.API_URL}/meetingroom`);
  }

  addRoom(room: Omit<MeetingRoom, 'id'>): Observable<MeetingRoom> {
    return this.http.post<MeetingRoom>(`${this.API_URL}/meetingroom`, room);
  }

  updateRoom(roomId: number, room: Partial<MeetingRoom>): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/meetingroom/${roomId}`, room);
  }

  deleteRoom(roomId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/meetingroom/${roomId}`);
  }

  // Users
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.API_URL}/user`);
  }

  updateUser(userId: number, payload: UpdateEmployeePayload): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/user/${userId}/employee`, payload);
  }

  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/user/${userId}`);
  }

  // Bookings
  getAllBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.API_URL}/booking`);
  }
}