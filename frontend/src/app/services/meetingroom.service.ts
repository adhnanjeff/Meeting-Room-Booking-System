import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MeetingRoom {
  id: number;
  roomName: string;
  capacity: number;
  amenities: string;
  isAvailable: boolean;
  totalBookings?: number;
}

@Injectable({
  providedIn: 'root'
})
export class MeetingRoomService {
  private readonly API_URL = 'https://localhost:7273/api/MeetingRoom';

  constructor(private http: HttpClient) {}

  getAllRooms(): Observable<MeetingRoom[]> {
    return this.http.get<MeetingRoom[]>(this.API_URL);
  }

  getAvailableRooms(startTime: string, endTime: string): Observable<MeetingRoom[]> {
    return this.http.get<MeetingRoom[]>(`${this.API_URL}/available?startTime=${startTime}&endTime=${endTime}`);
  }

  getRoomById(id: number): Observable<MeetingRoom> {
    return this.http.get<MeetingRoom>(`${this.API_URL}/${id}`);
  }

  createRoom(room: Omit<MeetingRoom, 'id'>): Observable<MeetingRoom> {
    return this.http.post<MeetingRoom>(this.API_URL, room);
  }

  updateRoom(id: number, room: Partial<MeetingRoom>): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/${id}`, room);
  }

  deleteRoom(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
