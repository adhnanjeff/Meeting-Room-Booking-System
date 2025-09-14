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
      <div class="page-header">
        <h1>🏢 Room Management</h1>
        <p>Configure and manage meeting rooms</p>
      </div>

      <div class="cards-grid">
        <div 
          *ngFor="let room of rooms" 
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
            <button class="btn-edit" (click)="editRoom(room)">Edit</button>
            <button class="btn-delete" (click)="deleteRoom(room.id)">Delete</button>
          </div>
        </div>
      </div>

      <!-- Edit Modal -->
      <div class="modal-overlay" *ngIf="showEditModal" (click)="closeModal()">
        <div class="modal-card" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Edit Room</h3>
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
              <label>
                <input type="checkbox" [(ngModel)]="editingRoom.isAvailable">
                Available
              </label>
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn-cancel" (click)="closeModal()">Cancel</button>
            <button class="btn-save" (click)="saveRoom()">Save</button>
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

    .page-header h1 {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 0.5rem;
    }

    .page-header p {
      color: var(--text-light);
      margin-bottom: 2rem;
    }

    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .room-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      border: 2px solid transparent;
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 200px;
    }

    .room-card.available {
      border-color: #10b981;
      background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
    }

    .room-card.booked {
      border-color: #ef4444;
      background: linear-gradient(135deg, #fef2f2 0%, #ffffff 100%);
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
    }

    .status-badge.available {
      background: #10b981;
      color: white;
    }

    .status-badge.booked {
      background: #ef4444;
      color: white;
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

    .btn-edit, .btn-delete {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-edit {
      background: #3b82f6;
      color: white;
    }

    .btn-edit:hover {
      background: #2563eb;
    }

    .btn-delete {
      background: #ef4444;
      color: white;
    }

    .btn-delete:hover {
      background: #dc2626;
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
      background: white;
      border-radius: 12px;
      padding: 2rem;
      width: 90%;
      max-width: 500px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
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
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 1rem;
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
      background: #f3f4f6;
      color: var(--text);
    }

    .btn-save {
      background: #3b82f6;
      color: white;
    }
  `]
})
export class Rooms implements OnInit {
  rooms: MeetingRoom[] = [];
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
      }
    });
  }

  editRoom(room: MeetingRoom) {
    this.editingRoom = { ...room };
    this.showEditModal = true;
  }

  closeModal() {
    this.showEditModal = false;
  }

  saveRoom() {
    const updatedRoom = {
      roomName: this.editingRoom.roomName,
      capacity: this.editingRoom.capacity,
      amenities: this.editingRoom.amenities,
      isAvailable: this.editingRoom.isAvailable
    };
    
    this.meetingRoomService.updateRoom(this.editingRoom.id, updatedRoom).subscribe({
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