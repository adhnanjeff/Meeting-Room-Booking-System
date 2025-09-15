import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Notification {
  id: number;
  title: string;
  message: string;
  timestamp: string;
  fromUser: string;
  isRead: boolean;
  userId: number;
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
    return this.http.put<void>(`${this.API_URL}/${notificationId}/read`, {});
  }

  createNotification(notification: CreateNotificationDto): Observable<Notification> {
    return this.http.post<Notification>(this.API_URL, notification);
  }

  deleteNotification(notificationId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${notificationId}`);
  }
}