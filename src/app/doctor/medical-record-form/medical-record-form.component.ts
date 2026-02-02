import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { AuthService } from '../../core/services/auth.service';
import {
    Appointment,
    MedicalRecord,
    Prescription,
    VitalSigns,
    AppointmentStatus
} from '../../core/models';

@Component({
    selector: 'app-medical-record-form',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './medical-record-form.component.html',
    styleUrls: ['./medical-record-form.component.scss']
})
export class MedicalRecordFormComponent implements OnInit {
    appointment: Appointment | null = null;

    record: Partial<MedicalRecord> = {
        diagnosis: '',
        symptoms: [],
        notes: '',
        prescription: [],
        vitals: {
            bloodPressure: '',
            heartRate: undefined,
            temperature: undefined,
            weight: undefined,
            oxygenSaturation: undefined
        }
    };

    symptomInput = '';
    newPrescription: Partial<Prescription> = {
        medication: '',
        dosage: '',
        frequency: '',
        duration: '',
        notes: ''
    };

    isLoading = true;
    isSubmitting = false;
    successMessage = '';
    errorMessage = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private dataService: DataService,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        const appointmentId = this.route.snapshot.paramMap.get('appointmentId');
        if (appointmentId) {
            this.loadAppointment(appointmentId);
        } else {
            this.isLoading = false;
            this.errorMessage = 'No appointment ID provided';
        }
    }

    loadAppointment(id: string): void {
        this.dataService.getAppointmentById(id).subscribe({
            next: (apt: Appointment | undefined) => {
                if (apt) {
                    this.appointment = apt;
                    this.record.patientId = apt.patientId;
                    this.record.appointmentId = apt.id;
                    this.record.doctorId = apt.doctorId;
                } else {
                    this.errorMessage = 'Appointment not found';
                }
                this.isLoading = false;
            },
            error: (err: any) => {
                console.error('Error loading appointment:', err);
                this.errorMessage = 'Failed to load appointment';
                this.isLoading = false;
            }
        });
    }

    addSymptom(): void {
        if (this.symptomInput.trim()) {
            if (!this.record.symptoms) {
                this.record.symptoms = [];
            }
            this.record.symptoms.push(this.symptomInput.trim());
            this.symptomInput = '';
        }
    }

    removeSymptom(index: number): void {
        this.record.symptoms?.splice(index, 1);
    }

    addPrescription(): void {
        if (this.newPrescription.medication && this.newPrescription.dosage) {
            if (!this.record.prescription) {
                this.record.prescription = [];
            }
            this.record.prescription.push({ ...this.newPrescription } as Prescription);
            this.resetPrescriptionForm();
        }
    }

    removePrescription(index: number): void {
        this.record.prescription?.splice(index, 1);
    }

    resetPrescriptionForm(): void {
        this.newPrescription = {
            medication: '',
            dosage: '',
            frequency: '',
            duration: '',
            notes: ''
        };
    }

    validateForm(): boolean {
        if (!this.record.diagnosis) {
            this.errorMessage = 'Please enter a diagnosis';
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

        const newRecord: MedicalRecord = {
            ...this.record as MedicalRecord,
            id: 'MR' + Date.now(),
            visitDate: new Date(),
            createdAt: new Date(),
            patient: this.appointment?.patient,
            doctor: this.appointment?.doctor
        };

        // Simulate API call
        setTimeout(() => {
            // Update appointment status
            if (this.appointment) {
                this.appointment.status = AppointmentStatus.COMPLETED;
            }

            this.isSubmitting = false;
            this.successMessage = 'Medical record saved successfully!';

            // Redirect after delay
            setTimeout(() => {
                this.router.navigate(['/doctor/patients']);
            }, 2000);
        }, 1000);
    }
}
