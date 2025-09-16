import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface User {
  id: number;
  userName: string;
  email: string;
  department: string;
  roles: string[];
  managerId?: number;
  managerName?: string;
}

export interface LoginRequest {
  userName: string;
  password: string;
}

export interface LoginResponse {
  token?: string;
  jwtToken?: string;
  access_token?: string;
  expiresAt?: string;
}

export interface RegisterRequest {
  userName: string;
  email: string;
  department: string;
  role: string;
  password: string;
  managerId?: number;
}


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'https://localhost:7273/api/Auth';
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;

  constructor(private http: HttpClient, private router: Router) {
    this.currentUserSubject = new BehaviorSubject<User | null>(null);
    this.currentUser$ = this.currentUserSubject.asObservable();
    this.loadUserFromStorage();
  }

  /**
   * ✅ Login (supports both hardcoded & API users)
   */
  login(username: string, password: string): Observable<any> {
    console.log('🔐 LOGIN ATTEMPT:', username);
    const loginData = { userName: username, password: password };
    return this.http.post<any>(`${this.API_URL}/login`, loginData).pipe(
      tap((res) => {
        console.log('📥 LOGIN RESPONSE:', res);
        console.log('📥 FULL RESPONSE OBJECT:', JSON.stringify(res, null, 2));
        const token = res.token || res.jwtToken || res.access_token;
        if (token) {
          console.log('🎫 TOKEN FOUND:', token);
          localStorage.setItem('token', token);
          if (res.expiresAt) {
            localStorage.setItem('tokenExpiry', res.expiresAt);
          }
          // Get fresh user data from API instead of relying on token
          this.getUserProfile(username).subscribe({
            next: (userProfile) => {
              console.log('👤 FRESH USER PROFILE FROM API:', userProfile);
              this.setUserFromProfile(userProfile);
            },
            error: (error) => {
              console.warn('⚠️ Failed to get user profile, falling back to token');
              this.loadUserFromToken(token);
            }
          });
        } else {
          console.warn('❌ NO TOKEN FOUND IN RESPONSE!');
          console.log('Available keys in response:', Object.keys(res));
        }
      })
    );
  }

  private getUserProfile(username: string): Observable<any> {
    console.log('🔍 FETCHING FRESH USER PROFILE FOR:', username);
    return this.http.get<any>(`https://localhost:7273/api/User/profile/${username}`);
  }

  private setUserFromProfile(profile: any): void {
    console.log('📋 SETTING USER FROM FRESH PROFILE:', profile);
    
    // Map role numbers to role names based on DB: 0=Employee, 1=Manager, 2=Admin
    let roleName = 'Employee';
    const roleValue = profile.userRole || profile.UserRole || profile.role || profile.Role || 0;
    console.log('🎯 ROLE VALUE FROM PROFILE API:', roleValue, 'TYPE:', typeof roleValue);
    console.log('🔍 CHECKING ROLE FIELDS:', {
      userRole: profile.userRole,
      UserRole: profile.UserRole, 
      role: profile.role,
      Role: profile.Role
    });
    
    const numericRole = parseInt(roleValue.toString());
    console.log('🔢 NUMERIC ROLE FROM PROFILE:', numericRole);
    
    switch (numericRole) {
      case 2:
        roleName = 'Admin';
        console.log('👑 PROFILE ROLE MAPPED TO: Admin');
        break;
      case 1:
        roleName = 'Manager';
        console.log('👔 PROFILE ROLE MAPPED TO: Manager');
        break;
      case 0:
      default:
        roleName = 'Employee';
        console.log('👤 PROFILE ROLE MAPPED TO: Employee');
        break;
    }
    
    const user: User = {
      id: profile.id || profile.Id || 0,
      userName: profile.userName || profile.UserName || '',
      email: profile.email || profile.Email || '',
      department: profile.department || profile.Department || '',
      roles: [roleName]
    };
    
    console.log('✅ FINAL USER FROM PROFILE:', JSON.stringify(user, null, 2));
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
    this.navigateByRole(user);
  }



  register(registerData: RegisterRequest): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/register`, registerData);
  }



  /**
   * ✅ Load user from token (for real API)
   */
  private loadUserFromToken(token: string): void {
    try {
      console.log('⚠️ FALLBACK: DECODING TOKEN (JWT may have stale role data)');
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('🎯 FULL JWT PAYLOAD:', JSON.stringify(payload, null, 2));
      
      const roleValue = payload.role || 
                       payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
                       '0';
      
      console.log('⚠️ TOKEN ROLE VALUE (may be stale):', roleValue);
      
      let roleName = 'Employee';
      const numericRole = parseInt(roleValue.toString());
      
      switch (numericRole) {
        case 2:
          roleName = 'Admin';
          break;
        case 1:
          roleName = 'Manager';
          break;
        case 0:
        default:
          roleName = 'Employee';
          break;
      }
      
      const user: User = {
        id: payload.nameid || payload.sub || payload.id || 0,
        userName: payload.sub || payload.unique_name || payload.userName || '',
        email: payload.email || '',
        department: payload.department || '',
        roles: [roleName]
      };
      
      console.log('⚠️ USER FROM TOKEN (may have stale role):', JSON.stringify(user, null, 2));
      localStorage.setItem('user', JSON.stringify(user));
      this.currentUserSubject.next(user);
      this.navigateByRole(user);
    } catch (e) {
      console.error('❌ ERROR DECODING TOKEN:', e);
      this.logout();
    }
  }

  private loadUserFromStorage(): void {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.currentUserSubject.next(user);
    }
  }

  logout(): void {
    localStorage.clear();
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.roles.includes(role) || false;
  }

  navigateByRole(user: User): void {
    const primaryRole = user.roles[0];
    console.log('🚀 =================== NAVIGATION ===================');
    console.log('🚀 USERNAME:', user.userName);
    console.log('🚀 USER ID:', user.id);
    console.log('🚀 PRIMARY ROLE:', primaryRole);
    console.log('🚀 ALL ROLES:', user.roles);
    console.log('🚀 EMAIL:', user.email);
    console.log('🚀 DEPARTMENT:', user.department);
    console.log('🚀 ================================================');
    
    switch (primaryRole) {
      case 'Employee':
        console.log('➡️ NAVIGATING TO: /employee (Employee Dashboard)');
        this.router.navigate(['/employee']);
        break;
      case 'Manager':
        console.log('➡️ NAVIGATING TO: /manager (Manager Dashboard)');
        this.router.navigate(['/manager']);
        break;
      case 'Admin':
        console.log('➡️ NAVIGATING TO: /admin (Admin Dashboard)');
        this.router.navigate(['/admin']);
        break;
      default:
        console.error('❌ UNKNOWN ROLE:', primaryRole, '- DEFAULTING TO EMPLOYEE');
        this.router.navigate(['/employee']);
        break;
    }
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.API_URL}/forgot-password`, { email });
  }

  resetPassword(email: string, token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.API_URL}/reset-password`, { email, token, newPassword });
  }

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.API_URL}/change-password`, { currentPassword, newPassword });
  }
}
