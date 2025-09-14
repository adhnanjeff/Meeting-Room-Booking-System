import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ApprovalRequest {
  status: 0 | 1 | 2;
  comments?: string;
}

export interface RoomSuggestion {
  suggestedRoomId: number;
  comments?: string;
}

export interface Approval {
  approvalId: number;
  bookingId: string;
  bookingTitle: string;
  requesterName: string;
  approverName?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  comments?: string;
  requestedAt: string;
  approvedAt?: string;
  meetingStartTime: string;
  meetingEndTime: string;
  roomName: string;
  suggestedRoomId?: number;
  suggestedRoomName?: string;
  rejectionComment?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApprovalService {
  private readonly API_URL = 'https://localhost:7273/api';

  constructor(private http: HttpClient) {}

  getPendingApprovals(managerId: number): Observable<Approval[]> {
    return this.http.get<Approval[]>(`${this.API_URL}/Approval/pending/${managerId}`);
  }

  getAllApprovals(managerId: number): Observable<Approval[]> {
    return this.http.get<Approval[]>(`${this.API_URL}/Approval/all/${managerId}`);
  }

  processApproval(approvalId: number, request: ApprovalRequest): Observable<Approval> {
    return this.http.put<Approval>(`${this.API_URL}/Approval/${approvalId}`, request);
  }

  suggestAlternativeRoom(approvalId: number, roomId: number, comments?: string): Observable<Approval> {
    const suggestion: RoomSuggestion = {
      suggestedRoomId: roomId,
      comments: comments
    };
    return this.http.put<Approval>(`${this.API_URL}/Approval/${approvalId}/suggest-room`, suggestion);
  }
}