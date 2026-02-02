import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../core/services/data.service';
import {
    Patient,
    Department,
    Clinic,
    Doctor,
    Shift,
    Appointment,
    AppointmentStatus
} from '../../core/models';

@Component({
    selector: 'app-appointment-scheduling',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './appointment-scheduling.component.html',
    styleUrls: ['./appointment-scheduling.component.scss']
})
export class AppointmentSchedulingComponent implements OnInit {
    patients: Patient[] = [];
    departments: Department[] = [];
    clinics: Clinic[] = [];
    filteredClinics: Clinic[] = [];
    doctors: Doctor[] = [];
    filteredDoctors: Doctor[] = [];
    shifts: Shift[] = [];
    filteredShifts: Shift[] = [];
    appointments: Appointment[] = [];

    // Form data
    selectedPatientId = '';
    selectedDepartmentId = '';
    selectedClinicId = '';
    selectedDoctorId = '';
    selectedShiftId = '';
    appointmentDate = '';
    notes = '';

    searchPatientQuery = '';
    searchResults: Patient[] = [];
    showSearchResults = false;
    selectedPatient: Patient | null = null;

    isLoading = true;
    isSubmitting = false;
    successMessage = '';
    errorMessage = '';

    constructor(private dataService: DataService) { }

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
        this.dataService.getPatients().subscribe((p: Patient[]) => this.patients = p);
        this.dataService.getDepartments().subscribe((d: Department[]) => this.departments = d.filter((dept: Department) => dept.isActive));
        this.dataService.getClinics().subscribe((c: Clinic[]) => this.clinics = c);
        this.dataService.getDoctors().subscribe((d: Doctor[]) => this.doctors = d.filter((doc: Doctor) => doc.status === 'ACTIVE'));
        this.dataService.getShifts().subscribe((s: Shift[]) => this.shifts = s);
        this.dataService.getAppointments().subscribe((a: Appointment[]) => {
            this.appointments = a;
            this.isLoading = false;
        });
    }

    searchPatient(): void {
        if (this.searchPatientQuery.length < 2) {
            this.searchResults = [];
            this.showSearchResults = false;
            return;
        }

        const query = this.searchPatientQuery.toLowerCase();
        this.searchResults = this.patients.filter(p =>
            p.fullName.toLowerCase().includes(query) ||
            p.phone.includes(query) ||
            p.nationalId.toLowerCase().includes(query)
        ).slice(0, 5);
        this.showSearchResults = true;
    }

    selectPatient(patient: Patient): void {
        this.selectedPatient = patient;
        this.selectedPatientId = patient.id;
        this.searchPatientQuery = patient.fullName;
        this.showSearchResults = false;
    }

    onDepartmentChange(): void {
        this.selectedClinicId = '';
        this.selectedDoctorId = '';
        this.selectedShiftId = '';

        this.filteredClinics = this.clinics.filter(c =>
            c.departmentId === this.selectedDepartmentId && c.isActive
        );
        this.filteredDoctors = this.doctors.filter(d =>
            d.specialtyId === this.selectedDepartmentId
        );
    }

    onClinicChange(): void {
        this.selectedShiftId = '';
        this.filteredShifts = this.shifts.filter(s =>
            s.clinicId === this.selectedClinicId && s.isActive
        );
    }

    getNextQueueNumber(): number {
        const todayAppointments = this.appointments.filter(a => {
            const aptDate = new Date(a.visitDate).toDateString();
            const selectedDate = new Date(this.appointmentDate).toDateString();
            return aptDate === selectedDate &&
                a.clinicId === this.selectedClinicId &&
                a.shiftId === this.selectedShiftId;
        });
        return todayAppointments.length + 1;
    }

    validateForm(): boolean {
        if (!this.selectedPatientId) {
            this.errorMessage = 'Please select a patient';
            return false;
        }
        if (!this.selectedDepartmentId) {
            this.errorMessage = 'Please select a department';
            return false;
        }
        if (!this.selectedClinicId) {
            this.errorMessage = 'Please select a clinic';
            return false;
        }
        if (!this.selectedDoctorId) {
            this.errorMessage = 'Please select a doctor';
            return false;
        }
        if (!this.selectedShiftId) {
            this.errorMessage = 'Please select a shift';
            return false;
        }
        if (!this.appointmentDate) {
            this.errorMessage = 'Please select a date';
            return false;
        }
        return true;
    }

    onSubmit(): void {
        this.errorMessage = '';
        this.successMessage = '';

        if (!this.validateForm()) {
            return;
        }

        this.isSubmitting = true;

        const queueNumber = this.getNextQueueNumber();
        const newAppointment: Appointment = {
            id: 'APT' + Date.now(),
            patientId: this.selectedPatientId,
            patient: this.selectedPatient!,
            departmentId: this.selectedDepartmentId,
            department: this.departments.find(d => d.id === this.selectedDepartmentId),
            clinicId: this.selectedClinicId,
            clinic: this.clinics.find(c => c.id === this.selectedClinicId),
            doctorId: this.selectedDoctorId,
            doctor: this.doctors.find(d => d.id === this.selectedDoctorId),
            shiftId: this.selectedShiftId,
            shift: this.shifts.find(s => s.id === this.selectedShiftId),
            queueNumber,
            visitDate: new Date(this.appointmentDate),
            status: AppointmentStatus.SCHEDULED,
            notes: this.notes,
            createdAt: new Date()
        };

        // Simulate API call
        setTimeout(() => {
            this.appointments.push(newAppointment);
            this.isSubmitting = false;
            this.successMessage = `Appointment scheduled successfully! Queue number: #${queueNumber}`;
            this.resetForm();
        }, 1000);
    }

    resetForm(): void {
        this.selectedPatientId = '';
        this.selectedDepartmentId = '';
        this.selectedClinicId = '';
        this.selectedDoctorId = '';
        this.selectedShiftId = '';
        this.appointmentDate = '';
        this.notes = '';
        this.searchPatientQuery = '';
        this.selectedPatient = null;
        this.filteredClinics = [];
        this.filteredDoctors = [];
        this.filteredShifts = [];
    }

    formatShift(shift: Shift): string {
        return `${shift.type} (${shift.startTime} - ${shift.endTime}) - ${shift.dayOfWeek}`;
    }
}
