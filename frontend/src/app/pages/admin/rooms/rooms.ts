import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MeetingRoomService, MeetingRoom } from '../../../services/meetingroom.service';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <!-- Summary Stats -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon"><i class="pi pi-building"></i></div>
          <div class="stat-content">
            <div class="stat-value">{{ totalRooms }}</div>
            <div class="stat-label">Total Rooms</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><i class="pi pi-check-circle"></i></div>
          <div class="stat-content">
            <div class="stat-value">{{ availableRooms }}</div>
            <div class="stat-label">Available</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><i class="pi pi-chart-bar"></i></div>
          <div class="stat-content">
            <div class="stat-value">{{ totalBookings }}</div>
            <div class="stat-label">Total Bookings</div>
          </div>
        </div>
      </div>

      <div class="page-header-card">
        <div class="page-header">
          <h1><i class="pi pi-building"></i> Room Management</h1>
          <p>Configure and manage meeting rooms</p>
        </div>
      </div>

      <!-- Controls -->
      <div class="controls">
        <div class="search-filter-group">
          <div class="search-box">
            <input 
              type="text" 
              placeholder="Search rooms..."
              [(ngModel)]="searchTerm"
              (input)="onSearchInput()"
            >
            <span class="search-icon"><i class="pi pi-search"></i></span>
          </div>
          <select [(ngModel)]="capacityFilter" (change)="filterRooms()" class="filter-select">
            <option value="">All Capacities</option>
            <option value="small">Small (1-6)</option>
            <option value="medium">Medium (7-12)</option>
            <option value="large">Large (13+)</option>
          </select>
          <select [(ngModel)]="availabilityFilter" (change)="filterRooms()" class="filter-select">
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="booked">Booked</option>
          </select>
        </div>
        <div class="action-buttons">
          <div class="view-toggle">
            <button 
              class="toggle-btn" 
              [class.active]="viewMode === 'table'"
              (click)="setViewMode('table')"
              title="Table View"><i class="pi pi-table"></i></button>
            <button 
              class="toggle-btn" 
              [class.active]="viewMode === 'card'"
              (click)="setViewMode('card')"
              title="Card View"><i class="pi pi-th-large"></i></button>
          </div>
          <button class="btn-export" (click)="exportData('csv')" title="Export CSV"><i class="pi pi-file"></i> CSV</button>
          <button class="btn-export" (click)="exportData('excel')" title="Export Excel"><i class="pi pi-file-excel"></i> Excel</button>
          <button class="btn-add" (click)="addRoom()" title="Add Room"><i class="pi pi-plus"></i> Add Room</button>
        </div>
      </div>

      <!-- Table View -->
      <div class="table-container" *ngIf="viewMode === 'table'">
        <table class="data-table">
          <thead>
            <tr>
              <th (click)="sort('roomName')" class="sortable">
                Room Name <span class="sort-icon">{{ getSortIcon('roomName') }}</span>
              </th>
              <th (click)="sort('capacity')" class="sortable">
                Capacity <span class="sort-icon">{{ getSortIcon('capacity') }}</span>
              </th>
              <th>Facilities</th>
              <th (click)="sort('isAvailable')" class="sortable">
                Availability <span class="sort-icon">{{ getSortIcon('isAvailable') }}</span>
              </th>
              <th>Total Bookings</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let room of paginatedRooms" class="table-row">
              <td class="room-name" (click)="showRoomPreview(room)">
                <div class="room-icon"><i class="pi pi-building"></i></div>
                {{ room.roomName }}
              </td>
              <td class="capacity">
                <span class="capacity-badge" [class]="getCapacityClass(room.capacity)">
                  <i class="pi pi-users"></i> {{ room.capacity }}
                </span>
              </td>
              <td class="facilities">
                <div class="facility-icons">
                  <span *ngFor="let facility of getFacilityIcons(room.amenities)" class="facility-icon" [title]="facility.name" [innerHTML]="facility.icon">
                  </span>
                </div>
              </td>
              <td>
                <span class="status-badge" [class.available]="room.isAvailable" [class.booked]="!room.isAvailable">
                  {{ room.isAvailable ? 'Available' : 'Booked' }}
                </span>
              </td>
              <td class="booking-count">{{ room.totalBookings || 0 }}</td>
              <td class="actions">
                <button class="action-btn view" (click)="viewRoomBookings(room.id)" title="View Bookings"><i class="pi pi-eye"></i></button>
                <button class="action-btn edit" (click)="editRoom(room)" title="Edit Room"><i class="pi pi-pencil"></i></button>
                <button class="action-btn delete" (click)="deleteRoom(room.id)" title="Delete Room"><i class="pi pi-trash"></i></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Card View -->
      <div class="cards-grid" *ngIf="viewMode === 'card'">
        <div 
          *ngFor="let room of paginatedRooms" 
          class="room-card"
          [class.available]="room.isAvailable"
          [class.booked]="!room.isAvailable"
          (click)="showRoomPreview(room)"
        >
          <div class="room-header">
            <h3>{{ room.roomName }}</h3>
            <span class="status-badge" [class.available]="room.isAvailable" [class.booked]="!room.isAvailable">
              {{ room.isAvailable ? 'Available' : 'Booked' }}
            </span>
          </div>
          
          <div class="room-details">
            <div class="detail-item">
              <span class="capacity-badge" [class]="getCapacityClass(room.capacity)">
                <i class="pi pi-users"></i> {{ room.capacity }} people
              </span>
            </div>
            
            <div class="facilities-section" *ngIf="room.amenities">
              <div class="facility-icons">
                <span *ngFor="let facility of getFacilityIcons(room.amenities)" 
                      class="facility-icon" 
                      [title]="facility.name"
                      [innerHTML]="facility.icon">
                </span>
              </div>
            </div>
            
            <div class="booking-stats">
              <span class="booking-count"><i class="pi pi-chart-bar"></i> {{ room.totalBookings || 0 }} bookings</span>
            </div>
          </div>
          
          <div class="room-actions" (click)="$event.stopPropagation()">
            <button class="action-btn view" (click)="viewRoomBookings(room.id)" title="View Bookings"><i class="pi pi-eye"></i></button>
            <button class="action-btn edit" (click)="editRoom(room)" title="Edit Room"><i class="pi pi-pencil"></i></button>
            <button class="action-btn delete" (click)="deleteRoom(room.id)" title="Delete Room"><i class="pi pi-trash"></i></button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="pagination">
        <div class="pagination-info">
          Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ Math.min(currentPage * pageSize, filteredRooms.length) }} of {{ filteredRooms.length }} rooms
        </div>
        <div class="pagination-controls">
          <button (click)="previousPage()" [disabled]="currentPage === 1" class="page-btn">‹</button>
          <span *ngFor="let page of getPageNumbers()" 
                (click)="goToPage(page)" 
                [class.active]="page === currentPage"
                class="page-number">{{ page }}</span>
          <button (click)="nextPage()" [disabled]="currentPage === totalPages" class="page-btn">›</button>
        </div>
      </div>

      <!-- Room Preview Modal -->
      <div class="modal-overlay" *ngIf="showPreviewModal" (click)="closePreviewModal()">
        <div class="preview-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ selectedRoom?.roomName }}</h3>
            <button class="close-btn" (click)="closePreviewModal()">×</button>
          </div>
          <div class="preview-content" *ngIf="selectedRoom">
            <div class="preview-stats">
              <div class="preview-stat">
                <span class="stat-label">Capacity</span>
                <span class="stat-value"><i class="pi pi-users"></i> {{ selectedRoom.capacity }}</span>
              </div>
              <div class="preview-stat">
                <span class="stat-label">Status</span>
                <span class="status-badge" [class.available]="selectedRoom.isAvailable" [class.booked]="!selectedRoom.isAvailable">
                  {{ selectedRoom.isAvailable ? 'Available' : 'Booked' }}
                </span>
              </div>
              <div class="preview-stat">
                <span class="stat-label">Total Bookings</span>
                <span class="stat-value">{{ selectedRoom.totalBookings || 0 }}</span>
              </div>
            </div>
            <div class="preview-facilities">
              <h4>Facilities</h4>
              <div class="facility-list">
                <span *ngFor="let facility of getFacilityIcons(selectedRoom.amenities)" 
                      class="facility-item">
                  <span [innerHTML]="facility.icon"></span> {{ facility.name }}
                </span>
              </div>
            </div>
            <div class="preview-actions">
              <button class="btn-primary" (click)="editRoom(selectedRoom)">Edit Room</button>
              <button class="btn-secondary" (click)="viewRoomBookings(selectedRoom.id)">View Bookings</button>
            </div>
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
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: var(--surface);
      border-radius: 16px;
      padding: 1.5rem;
      color: var(--text);
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      transition: transform 0.2s ease;
      border-left: 12px solid #4f46e5;
      border: 1px solid var(--border);
    }

    .stat-card:hover {
      transform: translateY(-4px);
    }

    .stat-card:nth-child(2) {
      border-left-color: #ec4899;
    }

    .stat-card:nth-child(3) {
      border-left-color: #06b6d4;
    }

    .stat-icon {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      color: white;
    }

    .stat-card:nth-child(1) .stat-icon {
      background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
    }

    .stat-card:nth-child(2) .stat-icon {
      background: linear-gradient(135deg, #ec4899 0%, #f472b6 100%);
    }

    .stat-card:nth-child(3) .stat-icon {
      background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
    }

    .stat-icon {
      font-size: 2rem;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 0.25rem;
    }

    .stat-label {
      font-size: 0.9rem;
      opacity: 0.9;
    }

    .page-header-card {
      background: var(--surface);
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
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
      flex-wrap: wrap;
    }

    .search-filter-group {
      display: flex;
      gap: 1rem;
      flex: 1;
      flex-wrap: wrap;
    }

    .search-box {
      position: relative;
      flex: 1;
      min-width: 200px;
      max-width: 300px;
    }

    .search-box input {
      width: 100%;
      padding: 0.75rem 2.5rem 0.75rem 1rem;
      border: 1px solid var(--border);
      border-radius: 12px;
      background: var(--surface);
      color: var(--text);
      font-size: 1rem;
      transition: border-color 0.2s ease;
    }

    .search-box input:focus {
      outline: none;
      border-color: #667eea;
    }

    .search-icon {
      position: absolute;
      right: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-light);
    }

    .filter-select {
      padding: 0.75rem 1rem;
      border: 1px solid var(--border);
      border-radius: 12px;
      background: var(--surface);
      color: var(--text);
      font-size: 1rem;
      cursor: pointer;
      min-width: 120px;
    }

    .action-buttons {
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }

    .view-toggle {
      display: flex;
      background: var(--background);
      border-radius: 12px;
      padding: 0.25rem;
      border: 1px solid var(--border);
    }

    .toggle-btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 8px;
      background: transparent;
      color: var(--text-light);
      cursor: pointer;
      font-size: 1rem;
      transition: all 0.2s ease;
    }

    .toggle-btn.active {
      background: #667eea;
      color: white;
    }

    .btn-export {
      padding: 0.75rem 1rem;
      border: none;
      border-radius: 12px;
      color: white;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .btn-export:first-of-type {
      background: var(--error);
    }

    .btn-export:nth-of-type(2) {
      background: var(--success);
    }

    .btn-export:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }

    .btn-add {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 12px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .btn-add:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }

    .table-container {
      background: var(--surface);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
      border: 1px solid var(--border);
      margin-bottom: 2rem;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
    }

    .data-table th {
      background: var(--background);
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      color: var(--text);
      border-bottom: 1px solid var(--border);
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .data-table th.sortable {
      cursor: pointer;
      user-select: none;
      transition: background-color 0.2s ease;
    }

    .data-table th.sortable:hover {
      background: var(--surface);
    }

    .sort-icon {
      margin-left: 0.5rem;
      font-size: 0.8rem;
      color: var(--text-light);
    }

    .data-table td {
      padding: 1rem;
      border-bottom: 1px solid var(--border);
      color: var(--text);
      vertical-align: middle;
      text-align: center;
    }

    .data-table th {
      vertical-align: middle;
      text-align: center;
    }

    .table-row {
      transition: background-color 0.2s ease;
    }

    .table-row:hover {
      background: var(--background);
    }

    .room-name {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      font-weight: 500;
    }

    .room-icon {
      font-size: 1.2rem;
    }

    .capacity-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .capacity-badge.small {
      background: #e0f2fe;
      color: #0277bd;
    }

    .capacity-badge.medium {
      background: #fff3e0;
      color: #f57c00;
    }

    .capacity-badge.large {
      background: #e8f5e8;
      color: #2e7d32;
    }

    .facility-icons {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .facility-icon {
      font-size: 1.2rem;
      cursor: help;
    }

    .booking-count {
      font-weight: 600;
      color: #667eea;
    }

    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .room-card {
      background: var(--surface);
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
      border: 2px solid transparent;
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 240px;
      cursor: pointer;
    }

    .room-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.1);
    }

    .room-card.available {
      border-color: #10b981;
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, var(--surface) 100%);
    }

    .room-card.booked {
      border-color: #ef4444;
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, var(--surface) 100%);
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

    .facilities-section {
      margin: 1rem 0;
    }

    .booking-stats {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border);
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
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    }

    .status-badge.booked {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    }

    .actions {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
      align-items: center;
    }

    .action-btn {
      width: 32px;
      height: 32px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      transition: all 0.2s ease;
    }

    .action-btn.view {
      background: #e0f2fe;
      color: #0277bd;
    }

    .action-btn.edit {
      background: #fff3e0;
      color: #f57c00;
    }

    .action-btn.delete {
      background: #ffebee;
      color: #d32f2f;
    }

    .action-btn:hover {
      transform: scale(1.1);
    }

    .pagination {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 2rem;
      padding: 1rem;
      background: var(--surface);
      border-radius: 12px;
      border: 1px solid var(--border);
    }

    .pagination-info {
      color: var(--text-light);
      font-size: 0.9rem;
    }

    .pagination-controls {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .page-btn, .page-number {
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: var(--surface);
      color: var(--text);
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.2s ease;
    }

    .page-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .page-number.active {
      background: #667eea;
      color: white;
      border-color: #667eea;
    }

    .page-number:hover:not(.active) {
      background: var(--background);
    }

    .preview-modal {
      background: var(--surface);
      border-radius: 16px;
      padding: 2rem;
      width: 90%;
      max-width: 600px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    }

    .preview-content {
      margin-top: 1.5rem;
    }

    .preview-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .preview-stat {
      text-align: center;
      padding: 1rem;
      background: var(--background);
      border-radius: 12px;
    }

    .preview-stat .stat-label {
      display: block;
      font-size: 0.8rem;
      color: var(--text-light);
      margin-bottom: 0.5rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .preview-stat .stat-value {
      font-size: 1.2rem;
      font-weight: 600;
      color: var(--text);
    }

    .preview-facilities h4 {
      margin-bottom: 1rem;
      color: var(--text);
    }

    .facility-list {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .facility-item {
      padding: 0.5rem 1rem;
      background: var(--background);
      border-radius: 20px;
      font-size: 0.9rem;
      color: var(--text);
    }

    .preview-actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
    }

    .btn-primary, .btn-secondary {
      flex: 1;
      padding: 0.75rem 1rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .btn-primary {
      background: #667eea;
      color: white;
    }

    .btn-secondary {
      background: var(--background);
      color: var(--text);
      border: 1px solid var(--border);
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

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .controls {
        flex-direction: column;
        align-items: stretch;
      }

      .search-filter-group {
        flex-direction: column;
      }

      .action-buttons {
        justify-content: center;
        flex-wrap: wrap;
      }

      .cards-grid {
        grid-template-columns: 1fr;
      }

      .table-container {
        overflow-x: auto;
      }

      .data-table {
        min-width: 800px;
      }

      .pagination {
        flex-direction: column;
        gap: 1rem;
      }

      .preview-modal {
        width: 95%;
        padding: 1.5rem;
      }

      .preview-stats {
        grid-template-columns: 1fr;
      }

      .preview-actions {
        flex-direction: column;
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
  paginatedRooms: MeetingRoom[] = [];
  searchTerm = '';
  capacityFilter = '';
  availabilityFilter = '';
  showEditModal = false;
  showPreviewModal = false;
  private searchTimeout: any;
  editingRoom: MeetingRoom = { id: 0, roomName: '', capacity: 0, amenities: '', isAvailable: true };
  selectedRoom: MeetingRoom | null = null;
  
  // View mode
  viewMode: 'table' | 'card' = 'table';
  
  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  
  // Sorting
  sortField = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  
  // Stats - Initialize with default values
  totalRooms = 0;
  availableRooms = 0;
  totalBookings = 0;
  
  Math = Math;
  
  // Loading state
  isLoading = false;

  constructor(
    private meetingRoomService: MeetingRoomService,
    private adminService: AdminService
  ) {}

  ngOnInit() {
    this.loadRooms();
  }

  loadRooms() {
    this.isLoading = true;
    console.log('Attempting to load rooms from API...');
    this.meetingRoomService.getAllRooms().subscribe({
      next: (rooms) => {
        console.log('Rooms loaded successfully:', rooms);
        this.rooms = rooms || [];
        this.loadBookingCounts();
        this.updateStats();
        this.filterRooms();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading rooms:', error);
        // Add some mock data for testing
        this.rooms = [];
        this.updateStats();
        this.filterRooms();
        this.isLoading = false;
      }
    });
  }

  onSearchInput() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.filterRooms();
    }, 300);
  }

  filterRooms() {
    if (!this.rooms || this.rooms.length === 0) {
      this.filteredRooms = [];
      this.updatePagination();
      return;
    }
    
    let filtered = [...this.rooms];
    
    // Apply search filter
    if (this.searchTerm && this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(room =>
        (room.roomName || '').toLowerCase().includes(term) ||
        (room.amenities || '').toLowerCase().includes(term)
      );
    }
    
    // Apply capacity filter
    if (this.capacityFilter) {
      filtered = filtered.filter(room => {
        const capacity = room.capacity || 0;
        switch (this.capacityFilter) {
          case 'small': return capacity <= 6;
          case 'medium': return capacity >= 7 && capacity <= 12;
          case 'large': return capacity >= 13;
          default: return true;
        }
      });
    }
    
    // Apply availability filter
    if (this.availabilityFilter) {
      const isAvailable = this.availabilityFilter === 'available';
      filtered = filtered.filter(room => room.isAvailable === isAvailable);
    }
    
    this.filteredRooms = filtered;
    this.updatePagination();
  }
  
  updatePagination() {
    const totalItems = this.filteredRooms?.length || 0;
    this.totalPages = Math.max(1, Math.ceil(totalItems / this.pageSize));
    this.currentPage = Math.min(this.currentPage, this.totalPages);
    
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedRooms = this.filteredRooms?.slice(startIndex, endIndex) || [];
  }
  
  sort(field: string) {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    
    this.filteredRooms.sort((a, b) => {
      let aValue = this.getFieldValue(a, field);
      let bValue = this.getFieldValue(b, field);
      
      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    this.updatePagination();
  }
  
  getFieldValue(room: MeetingRoom, field: string): any {
    switch (field) {
      case 'roomName': return room.roomName.toLowerCase();
      case 'capacity': return room.capacity;
      case 'isAvailable': return room.isAvailable ? 1 : 0;
      default: return '';
    }
  }
  
  getSortIcon(field: string): string {
    if (this.sortField !== field) return '↕';
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }
  
  setViewMode(mode: 'table' | 'card') {
    this.viewMode = mode;
  }
  
  getCapacityClass(capacity: number): string {
    if (capacity <= 6) return 'small';
    if (capacity <= 12) return 'medium';
    return 'large';
  }
  
  getFacilityIcons(amenities: string): { icon: string, name: string }[] {
    if (!amenities || typeof amenities !== 'string') return [];
    
    const facilityMap: { [key: string]: string } = {
      'projector': 'pi pi-desktop',
      'whiteboard': 'pi pi-tablet',
      'tv': 'pi pi-desktop',
      'screen': 'pi pi-desktop',
      'phone': 'pi pi-phone',
      'video': 'pi pi-video',
      'conference': 'pi pi-video',
      'wifi': 'pi pi-wifi',
      'computer': 'pi pi-desktop',
      'microphone': 'pi pi-microphone',
      'speaker': 'pi pi-volume-up'
    };
    
    try {
      const facilities = amenities.toLowerCase().split(/[,\s]+/).filter(f => f.trim().length > 0);
      return facilities.map(facility => {
        const cleanFacility = facility.trim();
        const icon = Object.keys(facilityMap).find(key => cleanFacility.includes(key));
        return {
          icon: icon ? `<i class="${facilityMap[icon]}"></i>` : '<i class="pi pi-cog"></i>',
          name: cleanFacility.charAt(0).toUpperCase() + cleanFacility.slice(1)
        };
      }).filter(f => f.name && f.name.length > 0);
    } catch (error) {
      console.error('Error parsing facilities:', error);
      return [];
    }
  }
  
  // Pagination methods
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }
  
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }
  
  goToPage(page: number) {
    this.currentPage = page;
    this.updatePagination();
  }
  
  getPageNumbers(): number[] {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }
  
  showRoomPreview(room: MeetingRoom) {
    this.selectedRoom = room;
    this.showPreviewModal = true;
  }
  
  closePreviewModal() {
    this.showPreviewModal = false;
    this.selectedRoom = null;
  }
  
  exportData(format: 'csv' | 'excel') {
    const data = this.filteredRooms.map(room => ({
      'Room Name': room.roomName,
      'Capacity': room.capacity,
      'Amenities': room.amenities,
      'Availability': room.isAvailable ? 'Available' : 'Booked',
      'Total Bookings': room.totalBookings || 0
    }));

    if (format === 'csv') {
      this.downloadCSV(data);
    } else {
      this.downloadExcel(data);
    }
  }

  private downloadCSV(data: any[]) {
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rooms_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private downloadExcel(data: any[]) {
    const headers = Object.keys(data[0]);
    let excelContent = '<table>';
    
    // Add headers
    excelContent += '<tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr>';
    
    // Add data rows
    data.forEach(row => {
      excelContent += '<tr>' + headers.map(h => `<td>${row[h]}</td>`).join('') + '</tr>';
    });
    
    excelContent += '</table>';
    
    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rooms_${new Date().toISOString().split('T')[0]}.xls`;
    link.click();
    window.URL.revokeObjectURL(url);
  }
  
  updateStats() {
    if (!this.rooms || !Array.isArray(this.rooms)) {
      this.totalRooms = 0;
      this.availableRooms = 0;
      this.totalBookings = 0;
      return;
    }
    
    this.totalRooms = this.rooms.length;
    this.availableRooms = this.rooms.filter(room => room && room.isAvailable).length;
    this.totalBookings = this.rooms.reduce((sum, room) => sum + (room?.totalBookings || 0), 0);
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

  loadBookingCounts() {
    this.rooms.forEach(room => {
      this.adminService.getRoomBookingCount(room.id).subscribe({
        next: (count) => {
          room.totalBookings = count;
        },
        error: (error) => {
          console.error(`Error loading booking count for room ${room.id}:`, error);
          room.totalBookings = 0;
        }
      });
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