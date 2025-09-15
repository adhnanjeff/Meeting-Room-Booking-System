import { Routes } from '@angular/router';

export const managerRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/manager-layout').then(m => m.ManagerLayout),
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', loadComponent: () => import('./home/manager-home').then(m => m.ManagerHome) },
      { path: 'approvals', loadComponent: () => import('./approvals/approvals').then(m => m.Approvals) },
      { path: 'team', loadComponent: () => import('./team/team').then(m => m.Team) },
      { path: 'book-meeting', loadComponent: () => import('./book-meeting/book-meeting.component').then(m => m.BookMeetingComponent) },
      { path: 'calendar', loadComponent: () => import('../../components/calendar/calendar.component').then(m => m.CalendarComponent) },
      { path: 'my-bookings', loadComponent: () => import('../employee/my-bookings/my-bookings').then(m => m.MyBookings) },
      { path: 'invitations', loadComponent: () => import('../../components/invitations/invitations').then(m => m.Invitations) },
      { path: 'scheduled-meetings', loadComponent: () => import('../../components/scheduled-meetings/scheduled-meetings').then(m => m.ScheduledMeetings) },
      { path: 'notifications', loadComponent: () => import('../../components/notifications/notifications').then(m => m.Notifications) },
      { path: 'profile', loadComponent: () => import('../employee/profile/profile').then(m => m.Profile) }
    ]
  }
];