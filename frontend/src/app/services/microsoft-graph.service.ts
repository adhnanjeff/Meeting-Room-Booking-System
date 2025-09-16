import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TeamsEventRequest {
  subject: string;
  body: string;
  startDateTime: string;
  endDateTime: string;
  timeZone: string;
  location: string;
  attendees: string[];
  organizerEmail: string;
}

export interface TeamsEventResponse {
  id: string;
  webLink: string;
  onlineMeeting?: {
    joinUrl: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class MicrosoftGraphService {
  private readonly API_URL = 'https://localhost:7273/api/MicrosoftGraph';

  constructor(private http: HttpClient) {}

  createTeamsEvent(eventData: TeamsEventRequest): Observable<TeamsEventResponse> {
    return this.http.post<TeamsEventResponse>(`${this.API_URL}/create-event`, eventData);
  }

  updateTeamsEvent(eventId: string, eventData: TeamsEventRequest): Observable<TeamsEventResponse> {
    return this.http.put<TeamsEventResponse>(`${this.API_URL}/update-event/${eventId}`, eventData);
  }

  deleteTeamsEvent(eventId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/delete-event/${eventId}`);
  }
}