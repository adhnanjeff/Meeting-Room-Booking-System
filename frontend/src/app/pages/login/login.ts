import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService, LoginRequest } from '../../services/auth.service';
import { LoaderService } from '../../services/loader.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  credentials: LoginRequest = {
    userName: '',
    password: ''
  };
  
  isLoading = false;
  error = '';

  constructor(
    private authService: AuthService, 
    private router: Router,
    private loaderService: LoaderService
  ) {}

  onSubmit(): void {
    if (!this.credentials.userName || !this.credentials.password) {
      this.error = 'Please fill in all fields';
      return;
    }

    this.loaderService.show('Signing in...');
    this.error = '';

    this.authService.login(this.credentials.userName, this.credentials.password).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        setTimeout(() => {
          const user = this.authService.getCurrentUser();
          console.log('Current user:', user);
          if (user && user.roles && user.roles.length > 0) {
            console.log('User role:', user.roles[0]);
            this.authService.navigateByRole(user);
          } else {
            console.error('No user or roles found');
          }
          this.loaderService.hide();
        }, 100);
      },
      error: (error) => {
        console.error('Login error:', error);
        this.error = 'Invalid username or password';
        this.loaderService.hide();
      }
    });
  }

  // Demo login methods
  loginAsEmployee(): void {
    this.credentials = { userName: 'Mathi', password: 'password' };
    this.onSubmit();
  }

  loginAsManager(): void {
    this.credentials = { userName: 'Manager', password: 'password' };
    this.onSubmit();
  }

  loginAsAdmin(): void {
    this.credentials = { userName: 'Admin', password: 'Admin@123' };
    this.onSubmit();
  }


}
