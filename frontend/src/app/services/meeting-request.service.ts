import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface MeetingRequest {
  id: string;
  title: string;
  roomId: number;
  roomName: string;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
  attendeeCount: number;
  attendeeIds: number[];
  attendeeNames: string[];
  isEmergency: boolean;
  refreshmentRequests?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestedAt: string;
  managerComments?: string;
  alternativeRoomId?: number;
  alternativeRoomName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MeetingRequestService {
  private requestsSubject = new BehaviorSubject<MeetingRequest[]>([]);
  public requests$ = this.requestsSubject.asObservable();

  submitRequest(request: Omit<MeetingRequest, 'id' | 'status' | 'requestedAt'>): Observable<MeetingRequest> {
    return new Observable(observer => {
      setTimeout(() => {
        const newRequest: MeetingRequest = {
          ...request,
          id: Math.random().toString(36).substr(2, 9),
          status: 'Pending',
          requestedAt: new Date().toISOString()
        };
        
        const currentRequests = this.requestsSubject.value;
        this.requestsSubject.next([newRequest, ...currentRequests]);
        
        observer.next(newRequest);
        observer.complete();
      }, 1000);
    });
  }

  updateRequestRoom(requestId: string, newRoomId: number, newRoomName: string): Observable<MeetingRequest> {
    return new Observable(observer => {
      setTimeout(() => {
        const currentRequests = this.requestsSubject.value;
        const requestIndex = currentRequests.findIndex(r => r.id === requestId);
        
        if (requestIndex !== -1) {
          const updatedRequest = {
            ...currentRequests[requestIndex],
            alternativeRoomId: newRoomId,
            alternativeRoomName: newRoomName
          };
          
          currentRequests[requestIndex] = updatedRequest;
          this.requestsSubject.next([...currentRequests]);
          observer.next(updatedRequest);
        }
        
        observer.complete();
      }, 500);
    });
  }

  getUserRequests(userId: number): Observable<MeetingRequest[]> {
    return this.requests$;
  }

  getPendingRequests(): Observable<MeetingRequest[]> {
    return new Observable(observer => {
      const currentRequests = this.requestsSubject.value;
      const pendingRequests = currentRequests.filter(r => r.status === 'Pending');
      observer.next(pendingRequests);
      observer.complete();
    });
  }
}