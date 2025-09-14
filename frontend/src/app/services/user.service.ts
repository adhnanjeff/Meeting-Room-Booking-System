import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserInfo {
  id: number;
  userName: string;
  email: string;
  department: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = 'https://localhost:7273/api/User';

  constructor(private http: HttpClient) {}

  getUserById(id: number): Observable<UserInfo> {
    return this.http.get<UserInfo>(`${this.API_URL}/${id}`);
  }

  getAllUsers(): Observable<UserInfo[]> {
    return this.http.get<UserInfo[]>(this.API_URL);
  }

  getTeamMembers(managerId: number): Observable<UserInfo[]> {
    return this.http.get<UserInfo[]>(`${this.API_URL}/team/${managerId}`);
  }
}