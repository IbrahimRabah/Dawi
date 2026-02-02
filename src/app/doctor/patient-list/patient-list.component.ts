import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DataService, AuthService } from '../../core/services';
import { Appointment, AppointmentStatus, User, MedicalRecord } from '../../core/models';

@Component({
    selector: 'app-patient-list',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './patient-list.component.html',
    styleUrls: ['./patient-list.component.scss']
})
export class PatientListComponent implements OnInit {
    currentUser: User | null = null;
    appointments: Appointment[] = [];
    filteredAppointments: Appointment[] = [];
    selectedAppointment: Appointment | null = null;
    patientHistory: MedicalRecord[] = [];

    filterStatus = '';
    filterDate = 'today';
    isLoading = true;
    showDetailModal = false;

    AppointmentStatus = AppointmentStatus;

    constructor(
        private dataService: DataService,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.currentUser = this.authService.getCurrentUser();
        this.loadAppointments();
    }

    loadAppointments(): void {
        this.dataService.getAppointments().subscribe({
            next: (appointments: Appointment[]) => {
                // Filter appointments for current doctor
                this.appointments = appointments.filter((a: Appointment) =>
                    this.currentUser?.doctorId ? a.doctorId === this.currentUser.doctorId : true
                );
                this.applyFilters();
                this.isLoading = false;
            },
            error: (err: any) => {
                console.error('Error loading appointments:', err);
                this.isLoading = false;
            }
        });
    }

    applyFilters(): void {
        let result = [...this.appointments];
        const today = new Date().toDateString();

        if (this.filterDate === 'today') {
            result = result.filter(a => new Date(a.visitDate).toDateString() === today);
        }

        if (this.filterStatus) {
            result = result.filter(a => a.status === this.filterStatus);
        }

        // Sort by queue number
        result.sort((a, b) => a.queueNumber - b.queueNumber);
        this.filteredAppointments = result;
    }

    openPatientDetails(apt: Appointment): void {
        this.selectedAppointment = apt;
        this.loadPatientHistory(apt.patientId);
        this.showDetailModal = true;
    }

    loadPatientHistory(patientId: string): void {
        this.dataService.getMedicalRecordsByPatient(patientId).subscribe((records: MedicalRecord[]) => {
            this.patientHistory = records.sort((a: MedicalRecord, b: MedicalRecord) =>
                new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime()
            );
        });
    }

    closeModal(): void {
        this.showDetailModal = false;
        this.selectedAppointment = null;
        this.patientHistory = [];
    }

    startExamination(apt: Appointment): void {
        apt.status = AppointmentStatus.IN_PROGRESS;
        this.applyFilters();
    }

    getStatusClass(status: string): string {
        const classes: Record<string, string> = {
            'SCHEDULED': 'badge-info',
            'WAITING': 'badge-warning',
            'IN_PROGRESS': 'badge-primary',
            'COMPLETED': 'badge-success',
            'CANCELLED': 'badge-danger'
        };
        return classes[status] || 'badge-info';
    }
}
