import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService, User, Booking, UpdateEmployeePayload } from '../../../services/admin.service';
import { MeetingRoomService, MeetingRoom } from '../../../services/meetingroom.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  activeTab = 'rooms';
  
  // Rooms
  rooms: MeetingRoom[] = [];
  filteredRooms: MeetingRoom[] = [];
  roomFilter = '';
  showAddRoom = false;
  editingRoom: MeetingRoom | null = null;
  newRoom: Omit<MeetingRoom, 'id'> = {
    roomName: '',
    capacity: 0,
    amenities: '',
    isAvailable: true
  };

  // Users
  users: User[] = [];
  filteredUsers: User[] = [];
  departmentFilter = '';
  editingUser: (User & { role?: 'Employee' | 'Manager' | 'Admin' }) | null = null;
  departments: string[] = [];

  // Bookings
  bookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  bookingFilter = 'all';

  constructor(
    private adminService: AdminService, 
    private router: Router,
    private meetingRoomService: MeetingRoomService
  ) {}

  ngOnInit() {
    // Set active tab based on current route
    const currentRoute = this.router.url.split('/').pop();
    switch (currentRoute) {
      case 'users':
        this.activeTab = 'users';
        break;
      case 'rooms':
        this.activeTab = 'rooms';
        break;
      case 'bookings':
        this.activeTab = 'bookings';
        break;
      default:
        this.activeTab = 'rooms';
    }
    
    this.loadRooms();
    this.loadUsers();
    this.loadBookings();
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  // Room Management
  loadRooms() {
    console.log('Loading rooms...');
    this.meetingRoomService.getAllRooms().subscribe({
      next: (rooms) => {
        console.log('Rooms loaded:', rooms);
        this.rooms = rooms;
        this.filteredRooms = rooms;
      },
      error: (error) => {
        console.error('Error loading rooms:', error);
        alert('Failed to load rooms. Check console for details.');
      }
    });
  }

  filterRooms() {
    this.filteredRooms = this.rooms.filter(room =>
      room.roomName.toLowerCase().includes(this.roomFilter.toLowerCase()) ||
      room.amenities.toLowerCase().includes(this.roomFilter.toLowerCase())
    );
  }

  addRoom() {
    this.meetingRoomService.createRoom(this.newRoom).subscribe({
      next: () => {
        this.loadRooms();
        this.showAddRoom = false;
        this.resetNewRoom();
      },
      error: (error) => console.error('Error adding room:', error)
    });
  }

  editRoom(room: MeetingRoom) {
    this.editingRoom = { ...room };
  }

  updateRoom() {
    if (this.editingRoom) {
      this.meetingRoomService.updateRoom(this.editingRoom.id, this.editingRoom).subscribe({
        next: () => {
          this.loadRooms();
          this.editingRoom = null;
        },
        error: (error) => console.error('Error updating room:', error)
      });
    }
  }

  deleteRoom(roomId: number) {
    if (confirm('Are you sure you want to delete this room?')) {
      this.meetingRoomService.deleteRoom(roomId).subscribe({
        next: () => this.loadRooms(),
        error: (error) => console.error('Error deleting room:', error)
      });
    }
  }

  resetNewRoom() {
    this.newRoom = {
      roomName: '',
      capacity: 0,
      amenities: '',
      isAvailable: true
    };
  }

  // User Management
  loadUsers() {
    console.log('Loading users...');
    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        console.log('Users loaded:', users);
        this.users = users;
        this.filteredUsers = users;
        this.departments = [...new Set(users.map(u => u.department))];
      },
      error: (error) => {
        console.error('Error loading users:', error);
        alert('Failed to load users. Check console for details.');
      }
    });
  }

  filterUsers() {
    this.filteredUsers = this.users.filter(user =>
      this.departmentFilter === '' || user.department === this.departmentFilter
    );
  }

  editUser(user: User) {
    const primaryRole = user.roles?.[0] as 'Employee' | 'Manager' | 'Admin' | undefined;
    this.editingUser = { ...user, role: primaryRole };
  }

  updateUser() {
    if (this.editingUser) {
      const payload: UpdateEmployeePayload = {
        department: this.editingUser.department,
        managerId: this.editingUser.managerId,
        role: this.editingUser.role
      };
      const editingUserId = this.editingUser.id;
      this.adminService.updateUser(this.editingUser.id, payload).subscribe({
        next: () => {
          this.loadUsers();
          // Clear cached user data if current user was updated
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
          if (currentUser.id === editingUserId) {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            alert('Your role has been updated. Please login again.');
            window.location.href = '/login';
          }
          this.editingUser = null;
        },
        error: (error) => console.error('Error updating user:', error)
      });
    }
  }

  deleteUser(userId: number) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.adminService.deleteUser(userId).subscribe({
        next: () => this.loadUsers(),
        error: (error) => console.error('Error deleting user:', error)
      });
    }
  }

  // Booking Management
  loadBookings() {
    console.log('Loading bookings...');
    this.adminService.getAllBookings().subscribe({
      next: (bookings) => {
        console.log('Bookings loaded:', bookings);
        this.bookings = bookings;
        this.filterBookings();
      },
      error: (error) => {
        console.error('Error loading bookings:', error);
        alert('Failed to load bookings. Check console for details.');
      }
    });
  }

  filterBookings() {
    const now = new Date();
    this.filteredBookings = this.bookings.filter(booking => {
      const startTime = new Date(booking.startTime);
      const endTime = new Date(booking.endTime);
      
      switch (this.bookingFilter) {
        case 'past':
          return endTime < now;
        case 'current':
          return startTime <= now && endTime >= now;
        case 'upcoming':
          return startTime > now;
        default:
          return true;
      }
    });
  }
}