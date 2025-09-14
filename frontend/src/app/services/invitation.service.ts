import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface InvitationResponse {
  attendeeId: number;
  userId: number;
  userName: string;
  bookingId: string;
  bookingTitle: string;
  status: number;
  roleInMeeting: string;
}

@Injectable({
  providedIn: 'root'
})
export class InvitationService {
  private readonly API_URL = 'https://localhost:7273/api';

  constructor(private http: HttpClient) {}

  getUserInvitations(userId: number): Observable<InvitationResponse[]> {
    return this.http.get<InvitationResponse[]>(`${this.API_URL}/Attendee/invitations/${userId}`);
  }

  acceptInvitation(attendeeId: number): Observable<InvitationResponse> {
    return this.http.put<InvitationResponse>(`${this.API_URL}/Attendee/${attendeeId}/accept`, {});
  }

  declineInvitation(attendeeId: number): Observable<InvitationResponse> {
    return this.http.put<InvitationResponse>(`${this.API_URL}/Attendee/${attendeeId}/decline`, {});
  }
}