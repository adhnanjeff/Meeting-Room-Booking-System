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

export interface InvitationFilter {
  status?: 'Pending' | 'Accepted' | 'Declined';
  role?: 'Manager' | 'Employee';
  dateFrom?: string;
  dateTo?: string;
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

  getFilteredInvitations(userId: number, filter?: InvitationFilter): Observable<InvitationResponse[]> {
    let params = new URLSearchParams();
    if (filter?.status) params.append('status', filter.status);
    if (filter?.role) params.append('role', filter.role);
    if (filter?.dateFrom) params.append('dateFrom', filter.dateFrom);
    if (filter?.dateTo) params.append('dateTo', filter.dateTo);
    
    const queryString = params.toString();
    const url = queryString ? 
      `${this.API_URL}/Attendee/invitations/${userId}?${queryString}` : 
      `${this.API_URL}/Attendee/invitations/${userId}`;
    
    return this.http.get<InvitationResponse[]>(url);
  }

  getInvitationsByStatus(userId: number, status: 'Pending' | 'Accepted' | 'Declined'): Observable<InvitationResponse[]> {
    return this.http.get<InvitationResponse[]>(`${this.API_URL}/Attendee/invitations/${userId}?status=${status}`);
  }

  acceptInvitation(attendeeId: number): Observable<InvitationResponse> {
    return this.http.put<InvitationResponse>(`${this.API_URL}/Attendee/${attendeeId}/accept`, {});
  }

  declineInvitation(attendeeId: number): Observable<InvitationResponse> {
    return this.http.put<InvitationResponse>(`${this.API_URL}/Attendee/${attendeeId}/decline`, {});
  }
}