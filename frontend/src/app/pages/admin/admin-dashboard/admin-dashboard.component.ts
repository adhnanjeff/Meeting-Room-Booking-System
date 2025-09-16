import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AdminService, User, Booking, UpdateEmployeePayload } from '../../../services/admin.service';
import { MeetingRoomService, MeetingRoom } from '../../../services/meetingroom.service';
import { Chart, ChartConfiguration, ChartData, registerables } from 'chart.js';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('statusChart') statusChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('usageChart') usageChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('monthlyChart') monthlyChartRef!: ElementRef<HTMLCanvasElement>;

  private statusChart!: Chart;
  private usageChart!: Chart;
  private monthlyChart!: Chart;
  rooms: MeetingRoom[] = [];
  users: User[] = [];
  bookings: Booking[] = [];



  constructor(
    private adminService: AdminService, 
    private router: Router,
    private meetingRoomService: MeetingRoomService
  ) {
    Chart.register(...registerables);
  }

  ngOnInit() {
    this.loadRooms();
    this.loadUsers();
    this.loadBookings();
  }

  getPendingBookings(): number {
    return this.bookings.filter(b => b.status === 'Pending').length;
  }

  loadRooms() {
    this.meetingRoomService.getAllRooms().subscribe({
      next: (rooms) => this.rooms = rooms,
      error: (error) => console.error('Error loading rooms:', error)
    });
  }

  loadUsers() {
    this.adminService.getAllUsers().subscribe({
      next: (users) => this.users = users,
      error: (error) => console.error('Error loading users:', error)
    });
  }

  loadBookings() {
    this.adminService.getAllBookings().subscribe({
      next: (bookings) => {
        this.bookings = bookings;
        setTimeout(() => this.updateCharts(), 100);
      },
      error: (error) => console.error('Error loading bookings:', error)
    });
  }

  ngAfterViewInit() {
    this.initCharts();
  }

  initCharts() {
    this.statusChart = new Chart(this.statusChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Pending', 'Approved', 'Rejected'],
        datasets: [{
          data: [0, 0, 0],
          backgroundColor: ['#ffb64d', '#2ed8b6', '#ff5370']
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });

    this.usageChart = new Chart(this.usageChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: 'Bookings',
          data: [],
          backgroundColor: '#4099ff'
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });

    this.monthlyChart = new Chart(this.monthlyChartRef.nativeElement, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Monthly Bookings',
          data: [0, 0, 0, 0, 0, 0],
          borderColor: '#4099ff',
          backgroundColor: 'rgba(64, 153, 255, 0.1)',
          tension: 0.4
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  updateCharts() {
    if (!this.statusChart) return;
    
    const pending = this.bookings.filter(b => b.status === 'Pending').length;
    const approved = this.bookings.filter(b => b.status === 'Approved').length;
    const rejected = this.bookings.filter(b => b.status === 'Rejected').length;
    
    this.statusChart.data.datasets[0].data = [pending, approved, rejected];
    this.statusChart.update();

    const roomUsage = this.rooms.map(room => {
      const count = this.bookings.filter(b => b.roomName === room.roomName).length;
      return { room: room.roomName, count };
    }).sort((a, b) => b.count - a.count).slice(0, 5);

    this.usageChart.data.labels = roomUsage.map(r => r.room);
    this.usageChart.data.datasets[0].data = roomUsage.map(r => r.count);
    this.usageChart.update();
  }
}