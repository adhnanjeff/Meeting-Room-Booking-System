import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/admin-layout').then(m => m.AdminLayout),
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', loadComponent: () => import('./admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
      { path: 'users', loadComponent: () => import('./users/users').then(m => m.Users) },
      { path: 'rooms', loadComponent: () => import('./rooms/rooms').then(m => m.Rooms) },
      { path: 'analytics', loadComponent: () => import('./analytics/analytics.component').then(m => m.AnalyticsComponent) },
      { path: 'sustainability', loadComponent: () => import('./sustainability/sustainability.component').then(m => m.SustainabilityComponent) },
      { path: 'bookings', loadComponent: () => import('./admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent) }
    ]
  }
];