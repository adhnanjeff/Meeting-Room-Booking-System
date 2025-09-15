import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MeetingRoomService, MeetingRoom } from '../../../services/meetingroom.service';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="page-header-card">
        <div class="page-header">
          <h1>🏢 Room Management</h1>
          <p>Configure and manage meeting rooms</p>
        </div>
      </div>

      <div class="controls">
        <div class="search-box">
          <input 
            type="text" 
            placeholder="Search rooms..."
            [(ngModel)]="searchTerm"
            (input)="filterRooms()"
          >
          <span class="search-icon"><i class="pi pi-search"></i></span>
        </div>
        <button class="btn-add" (click)="addRoom()" title="Add Room">
          <i class="pi pi-plus"></i>
        </button>
      </div>

      <div class="cards-grid">
        <div 
          *ngFor="let room of filteredRooms" 
          class="room-card"
          [class.available]="room.isAvailable"
          [class.booked]="!room.isAvailable"
        >
          <div class="room-header">
            <h3>{{ room.roomName }}</h3>
            <span class="status-badge" [class.available]="room.isAvailable" [class.booked]="!room.isAvailable">
              {{ room.isAvailable ? 'Available' : 'Booked' }}
            </span>
          </div>
          
          <div class="room-details">
            <div class="detail-item">
              <span class="icon">👥</span>
              <span>{{ room.capacity }} people</span>
            </div>
            
            <div class="detail-item" *ngIf="room.amenities">
              <span class="icon">🛠️</span>
              <span>{{ room.amenities }}</span>
            </div>
            
            <div class="detail-item">
              <span class="icon">🆔</span>
              <span>Room ID: {{ room.id }}</span>
            </div>
          </div>
          
          <div class="room-actions">
            <button class="btn-round btn-primary" (click)="viewRoomBookings(room.id)" title="View Bookings"><i class="pi pi-search"></i></button>
            <button class="btn-round btn-secondary" (click)="editRoom(room)" title="Edit Room"><i class="pi pi-file-edit"></i></button>
            <button class="btn-round btn-danger" (click)="deleteRoom(room.id)" title="Delete Room"><i class="pi pi-trash"></i></button>
          </div>
        </div>
      </div>

      <!-- Edit Modal -->
      <div class="modal-overlay" *ngIf="showEditModal" (click)="closeModal()">
        <div class="modal-card" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ editingRoom.id === 0 ? 'Add Room' : 'Edit Room' }}</h3>
            <button class="close-btn" (click)="closeModal()">×</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Room Name</label>
              <input type="text" [(ngModel)]="editingRoom.roomName" class="form-input">
            </div>
            <div class="form-group">
              <label>Capacity</label>
              <input type="number" [(ngModel)]="editingRoom.capacity" class="form-input">
            </div>
            <div class="form-group">
              <label>Amenities</label>
              <input type="text" [(ngModel)]="editingRoom.amenities" class="form-input">
            </div>
            <div class="form-group">
              <label>Available</label>
              <input type="checkbox" [(ngModel)]="editingRoom.isAvailable" class="form-checkbox">
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn-cancel" (click)="closeModal()">Cancel</button>
            <button class="btn-save" (click)="saveRoom()">{{ editingRoom.id === 0 ? 'Create' : 'Save' }}</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header-card {
      background: var(--surface);
      border-radius: 12px;
      padding: 2rem;
      box-shadow: var(--shadow);
      border: 1px solid var(--border);
      margin-bottom: 2rem;
    }

    .page-header h1 {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 0.5rem;
    }

    .page-header p {
      color: var(--text-light);
      margin: 0;
    }

    .controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      gap: 1rem;
    }

    .search-box {
      position: relative;
      flex: 1;
      max-width: 400px;
    }

    .search-box input {
      width: 100%;
      padding: 0.75rem 2.5rem 0.75rem 1rem;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: var(--surface);
      color: var(--text);
      font-size: 1rem;
    }

    .search-icon {
      position: absolute;
      right: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-light);
    }

    .btn-add {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      border: none;
      background: #f59e0b;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      transition: all 0.2s ease;
    }

    .btn-add:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }

    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .room-card {
      background: var(--surface);
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: var(--shadow);
      border: 2px solid transparent;
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 220px;
    }

    .room-card.available {
      border-color: #10b981;
    }

    .room-card.booked {
      border-color: #ef4444;
    }

    .room-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .room-header h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text);
      margin: 0;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
      color: white;
    }

    .status-badge.available {
      background: #10b981;
    }

    .status-badge.booked {
      background: #ef4444;
    }

    .room-details {
      flex: 1;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
      color: var(--text-light);
      font-size: 0.9rem;
    }

    .icon {
      font-size: 1rem;
    }

    .room-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 1rem;
    }

    .btn-round {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.9rem;
      transition: all 0.2s ease;
    }

    .btn-primary {
      background: var(--primary);
      color: white;
    }

    .btn-secondary {
      background: #6b7280;
      color: white;
    }

    .btn-danger {
      background: #ef4444;
      color: white;
    }

    .btn-round:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-card {
      background: var(--surface);
      border-radius: 12px;
      padding: 2rem;
      width: 90%;
      max-width: 500px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    }

    @media (max-width: 768px) {
      .container {
        padding: 1rem;
      }

      .cards-grid {
        grid-template-columns: 1fr;
      }

      .modal-card {
        width: 95%;
        padding: 1.5rem;
      }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .modal-header h3 {
      margin: 0;
      font-size: 1.5rem;
      color: var(--text);
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: var(--text-light);
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: var(--text);
    }

    .form-input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid var(--border);
      border-radius: 6px;
      font-size: 1rem;
      background: var(--background);
      color: var(--text);
    }

    .form-input:focus {
      outline: none;
      border-color: var(--primary);
    }

    .form-checkbox {
      width: auto;
      margin-left: 0.5rem;
    }

    .modal-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 2rem;
    }

    .btn-cancel, .btn-save {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
    }

    .btn-cancel {
      background: var(--background);
      color: var(--text);
      border: 1px solid var(--border);
    }

    .btn-cancel:hover {
      background: var(--surface);
    }

    .btn-save {
      background: #3b82f6;
      color: white;
    }
  `]
})
export class Rooms implements OnInit {
  rooms: MeetingRoom[] = [];
  filteredRooms: MeetingRoom[] = [];
  searchTerm = '';
  showEditModal = false;
  editingRoom: MeetingRoom = { id: 0, roomName: '', capacity: 0, amenities: '', isAvailable: true };

  constructor(private meetingRoomService: MeetingRoomService) {}

  ngOnInit() {
    this.loadRooms();
  }

  loadRooms() {
    console.log('Attempting to load rooms from API...');
    this.meetingRoomService.getAllRooms().subscribe({
      next: (rooms) => {
        console.log('Rooms loaded successfully:', rooms);
        this.rooms = rooms;
        this.filterRooms();
      },
      error: (error) => {
        console.error('Error loading rooms:', error);
        console.error('Error details:', {
          status: error.status,
          message: error.message,
          url: error.url
        });
        // Add some mock data for testing
        this.rooms = [
          { id: 1, roomName: 'Conference Room A', capacity: 10, amenities: 'Projector, Whiteboard', isAvailable: true },
          { id: 2, roomName: 'Meeting Room B', capacity: 6, amenities: 'TV Screen, Phone', isAvailable: false },
          { id: 3, roomName: 'Board Room', capacity: 12, amenities: 'Video Conference, Projector', isAvailable: true }
        ];
        this.filterRooms();
      }
    });
  }

  filterRooms() {
    if (!this.searchTerm) {
      this.filteredRooms = this.rooms;
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredRooms = this.rooms.filter(room =>
        room.roomName.toLowerCase().includes(term) ||
        room.amenities.toLowerCase().includes(term)
      );
    }
  }

  addRoom() {
    this.editingRoom = { id: 0, roomName: '', capacity: 0, amenities: '', isAvailable: true };
    this.showEditModal = true;
  }

  editRoom(room: MeetingRoom) {
    this.editingRoom = { ...room };
    this.showEditModal = true;
  }

  closeModal() {
    this.showEditModal = false;
  }

  saveRoom() {
    const roomData = {
      roomName: this.editingRoom.roomName,
      capacity: this.editingRoom.capacity,
      amenities: this.editingRoom.amenities,
      isAvailable: this.editingRoom.isAvailable
    };
    
    if (this.editingRoom.id === 0) {
      // Create new room
      this.meetingRoomService.createRoom(roomData).subscribe({
        next: () => {
          console.log('Room created successfully');
          this.loadRooms();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error creating room:', error);
        }
      });
    } else {
      // Update existing room
      this.meetingRoomService.updateRoom(this.editingRoom.id, roomData).subscribe({
        next: () => {
          console.log('Room updated successfully');
          this.loadRooms();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error updating room:', error);
        }
      });
    }
  }

  viewRoomBookings(roomId: number) {
    // TODO: Implement viewBookingByRoomId functionality
    console.log('View bookings for room:', roomId);
    alert(`View booking history for Room ID: ${roomId}\n\nThis feature will show all bookings made for this room.`);
  }

  deleteRoom(roomId: number) {
    if (confirm('Are you sure you want to delete this room?')) {
      this.meetingRoomService.deleteRoom(roomId).subscribe({
        next: () => {
          console.log('Room deleted successfully');
          this.loadRooms();
        },
        error: (error) => {
          console.error('Error deleting room:', error);
          alert('Failed to delete room');
        }
      });
    }
  }
}