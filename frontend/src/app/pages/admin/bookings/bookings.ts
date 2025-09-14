import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, MeetingRoom } from '../../../services/admin.service';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="page-header">
        <h1>🏢 Meeting Rooms</h1>
        <p>Manage all office meeting rooms</p>
      </div>

      <!-- Add Room Form -->
      <div class="form-container">
        <input [(ngModel)]="newRoom.roomName" placeholder="Room Name" />
        <input [(ngModel)]="newRoom.capacity" type="number" placeholder="Capacity" />
        <button (click)="addRoom()">➕ Add Room</button>
      </div>

      <!-- Rooms Bento Grid -->
      <div class="bento-grid" *ngIf="rooms.length > 0; else emptyState">
        <div *ngFor="let room of rooms" 
             class="room-card" 
             [ngClass]="{
               'small': room.capacity <= 4,
               'medium': room.capacity > 4 && room.capacity <= 8,
               'large': room.capacity > 8,
               'available': room.isAvailable,
               'unavailable': !room.isAvailable
             }">
          <div class="room-header">
            <h3>{{ room.roomName }}</h3>
            <span class="capacity">{{ room.capacity }} people</span>
          </div>
          <div class="room-amenities">
            <span *ngFor="let amenity of room.amenities.split(', ')" class="amenity-tag">
              {{ amenity }}
            </span>
          </div>
          <div class="room-status">
            <span class="status-indicator" [ngClass]="room.isAvailable ? 'available' : 'unavailable'">
              {{ room.isAvailable ? 'Available' : 'Booked' }}
            </span>
          </div>
        </div>
      </div>

      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">📋</div>
          <h3>No Rooms Found</h3>
          <p>Add a new room to get started.</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .container { padding: 2rem; max-width: 1200px; margin: auto; }
    .page-header h1 { font-size: 2rem; font-weight: 700; margin-bottom: 0.5rem; }
    .form-container { margin-bottom: 2rem; display: flex; gap: 1rem; }
    input { padding: 0.5rem; border: 1px solid #ccc; border-radius: 5px; }
    button { padding: 0.5rem 1rem; margin-left: 0.5rem; cursor: pointer; }
    
    .bento-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }
    
    .room-card {
      border-radius: 12px;
      padding: 1.5rem;
      transition: all 0.3s ease;
      cursor: pointer;
      position: relative;
      overflow: hidden;
    }
    
    .room-card.small {
      grid-column: span 1;
      min-height: 150px;
    }
    
    .room-card.medium {
      grid-column: span 2;
      min-height: 180px;
    }
    
    .room-card.large {
      grid-column: span 3;
      min-height: 220px;
    }
    
    .room-card.available {
      background: linear-gradient(135deg, #e8f5e8, #c8e6c9);
      border: 2px solid #4caf50;
    }
    
    .room-card.unavailable {
      background: linear-gradient(135deg, #ffebee, #ffcdd2);
      border: 2px solid #f44336;
    }
    
    .room-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }
    
    .room-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    
    .room-header h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #333;
    }
    
    .capacity {
      background: rgba(255,255,255,0.8);
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.875rem;
      font-weight: 500;
    }
    
    .room-amenities {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }
    
    .amenity-tag {
      background: rgba(255,255,255,0.9);
      padding: 0.25rem 0.5rem;
      border-radius: 8px;
      font-size: 0.75rem;
      color: #666;
    }
    
    .room-status {
      position: absolute;
      top: 1rem;
      right: 1rem;
    }
    
    .status-indicator {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }
    
    .status-indicator.available {
      background: #4caf50;
      color: white;
    }
    
    .status-indicator.unavailable {
      background: #f44336;
      color: white;
    }
    
    .empty-state { text-align: center; padding: 3rem; color: gray; }
    .empty-icon { font-size: 3rem; margin-bottom: 1rem; }
    
    @media (max-width: 768px) {
      .room-card.medium, .room-card.large {
        grid-column: span 1;
      }
    }
  `]
})
export class Bookings implements OnInit {
  rooms: MeetingRoom[] = [];
  newRoom: Partial<MeetingRoom> = { roomName: '', capacity: 0 };

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadRooms();
  }

  loadRooms() {
    this.adminService.getAllRooms().subscribe((data: MeetingRoom[]) => this.rooms = data);
  }

  addRoom() {
    if (!this.newRoom.roomName || !this.newRoom.capacity) return;
    this.adminService.addRoom(this.newRoom as Omit<MeetingRoom, 'id'>).subscribe(() => {
      this.loadRooms();
      this.newRoom = { roomName: '', capacity: 0 };
    });
  }

  updateRoom(room: MeetingRoom) {
    this.adminService.updateRoom(room.id, room).subscribe(() => {
      this.loadRooms();
    });
  }

  deleteRoom(id: number) {
    this.adminService.deleteRoom(id).subscribe(() => {
      this.loadRooms();
    });
  }
}
