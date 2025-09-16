import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Notification {
  notificationId: number;
  title: string;
  message: string;
  createdAt: string;
  fromUser: string;
  isRead: boolean;
}

export interface CreateNotificationDto {
  title: string;
  message: string;
  fromUser: string;
  userId: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly API_URL = 'https://localhost:7273/api/Notification';

  constructor(private http: HttpClient) {}

  getUserNotifications(userId: number): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.API_URL}/user/${userId}`);
  }

  markAsRead(notificationId: number): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/${notificationId}/mark-read`, {});
  }

  getUnreadCount(userId: number): Observable<number> {
    return this.http.get<number>(`${this.API_URL}/user/${userId}/unread-count`);
  }

  createNotification(notification: CreateNotificationDto): Observable<Notification> {
    return this.http.post<Notification>(this.API_URL, notification);
  }

  deleteNotification(notificationId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${notificationId}`);
  }
}