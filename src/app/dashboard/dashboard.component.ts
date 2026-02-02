import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DataService, AuthService } from '../core/services';
import {
    Department,
    Doctor,
    Patient,
    Appointment,
    User,
    DashboardStats,
    AppointmentStatus,
    DoctorStatus
} from '../core/models';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
    currentUser: User | null = null;
    stats: DashboardStats = {
        totalPatients: 0,
        todayAppointments: 0,
        activeDoctors: 0,
        waitingPatients: 0,
        completedToday: 0,
        departments: 0
    };

    recentAppointments: Appointment[] = [];
    departments: Department[] = [];
    topDoctors: Doctor[] = [];
    isLoading = true;

    constructor(
        private dataService: DataService,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.currentUser = this.authService.getCurrentUser();
        this.loadDashboardData();
    }

    loadDashboardData(): void {
        // Load departments
        this.dataService.getDepartments().subscribe((depts: Department[]) => {
            this.departments = depts.filter((d: Department) => d.isActive);
            this.stats.departments = this.departments.length;
        });

        // Load patients count
        this.dataService.getPatients().subscribe((patients: Patient[]) => {
            this.stats.totalPatients = patients.length;
        });

        // Load doctors
        this.dataService.getDoctors().subscribe((doctors: Doctor[]) => {
            this.stats.activeDoctors = doctors.filter((d: Doctor) => d.status === DoctorStatus.ACTIVE).length;
            this.topDoctors = doctors.filter((d: Doctor) => d.status === DoctorStatus.ACTIVE).slice(0, 4);
        });

        // Load appointments
        this.dataService.getAppointments().subscribe((appointments: Appointment[]) => {
            const today = new Date().toDateString();
            const todayAppointments = appointments.filter((a: Appointment) =>
                new Date(a.visitDate).toDateString() === today
            );

            this.stats.todayAppointments = todayAppointments.length;
            this.stats.waitingPatients = appointments.filter((a: Appointment) =>
                a.status === AppointmentStatus.WAITING
            ).length;
            this.stats.completedToday = todayAppointments.filter((a: Appointment) =>
                a.status === AppointmentStatus.COMPLETED
            ).length;

            // Get recent appointments
            this.recentAppointments = appointments
                .sort((a: Appointment, b: Appointment) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime())
                .slice(0, 5);

            this.isLoading = false;
        });
    }

    getStatusClass(status: string): string {
        const statusClasses: Record<string, string> = {
            'SCHEDULED': 'badge-info',
            'WAITING': 'badge-warning',
            'IN_PROGRESS': 'badge-primary',
            'COMPLETED': 'badge-success',
            'CANCELLED': 'badge-danger',
            'NO_SHOW': 'badge-danger'
        };
        return statusClasses[status] || 'badge-info';
    }

    formatDate(date: Date | string): string {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    getGreeting(): string {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    }
}
