import { Routes } from '@angular/router';

export const employeeRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/employee-layout').then(m => m.EmployeeLayout),
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', loadComponent: () => import('./home/employee-home').then(m => m.EmployeeHome) },
      { path: 'book-room', loadComponent: () => import('./book-room/book-room').then(m => m.BookRoom) },
      { path: 'request-meeting', loadComponent: () => import('./book-room/book-room').then(m => m.BookRoom) },
      { path: 'my-bookings', loadComponent: () => import('./my-bookings/my-bookings').then(m => m.MyBookings) },
      { path: 'my-requests', loadComponent: () => import('./my-requests/my-requests').then(m => m.MyRequests) },
      { path: 'calendar', loadComponent: () => import('../../components/calendar/calendar.component').then(m => m.CalendarComponent) },
      { path: 'invitations', loadComponent: () => import('../../components/invitations/invitations').then(m => m.Invitations) },
      { path: 'scheduled-meetings', loadComponent: () => import('../../components/scheduled-meetings/scheduled-meetings').then(m => m.ScheduledMeetings) },
      { path: 'notifications', loadComponent: () => import('../../components/notifications/notifications').then(m => m.Notifications) },
      { path: 'profile', loadComponent: () => import('./profile/profile').then(m => m.Profile) }
    ]
  }
];