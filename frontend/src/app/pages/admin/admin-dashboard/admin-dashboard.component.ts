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
        console.log('Loaded bookings:', bookings.map(b => ({ status: b.status })));
        setTimeout(() => this.updateCharts(), 100);
      },
      error: (error) => console.error('Error loading bookings:', error)
    });
  }
  
  getMonthlyBookingData(): number[] {
    const monthlyData = new Array(12).fill(0);
    
    this.bookings.forEach(booking => {
      const date = new Date(booking.startTime);
      const month = date.getMonth();
      monthlyData[month]++;
    });
    
    return monthlyData;
  }

  ngAfterViewInit() {
    this.initCharts();
  }

  initCharts() {
    this.statusChart = new Chart(this.statusChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: []
        }]
      },
      options: { 
        responsive: true, 
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
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
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          label: 'Monthly Bookings',
          data: new Array(12).fill(0),
          borderColor: '#4099ff',
          backgroundColor: 'rgba(64, 153, 255, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: { 
        responsive: true, 
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  updateCharts() {
    if (!this.statusChart || !this.bookings.length) return;
    
    // Get all unique statuses from bookings
    const statusCounts = this.bookings.reduce((acc, booking) => {
      acc[booking.status] = (acc[booking.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Update status chart with all statuses
    const statuses = Object.keys(statusCounts);
    const counts = Object.values(statusCounts);
    const colors = {
      'Pending': '#ffb64d',
      'Approved': '#2ed8b6', 
      'Scheduled': '#4099ff',
      'Completed': '#28a745',
      'Rejected': '#ff5370',
      'Cancelled': '#6c757d'
    };
    
    this.statusChart.data.labels = statuses;
    this.statusChart.data.datasets[0].data = counts;
    this.statusChart.data.datasets[0].backgroundColor = statuses.map(status => 
      colors[status as keyof typeof colors] || '#6c757d'
    );
    this.statusChart.update();

    // Update room usage chart
    const roomUsage = this.rooms.map(room => {
      const count = this.bookings.filter(b => b.roomName === room.roomName).length;
      return { room: room.roomName, count };
    }).sort((a, b) => b.count - a.count).slice(0, 5);

    this.usageChart.data.labels = roomUsage.map(r => r.room);
    this.usageChart.data.datasets[0].data = roomUsage.map(r => r.count);
    this.usageChart.update();
    
    // Update monthly chart with actual data
    const monthlyData = this.getMonthlyBookingData();
    this.monthlyChart.data.datasets[0].data = monthlyData;
    this.monthlyChart.update();
  }
}