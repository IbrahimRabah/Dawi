import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Patient, Gender, BloodType } from '../../core/models';
import { DataService } from '../../core/services';

@Component({
    selector: 'app-patient-registration',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './patient-registration.component.html',
    styleUrls: ['./patient-registration.component.scss']
})
export class PatientRegistrationComponent implements OnInit {
    patient: Partial<Patient> = {
        fullName: '',
        age: 0,
        gender: Gender.MALE,
        phone: '',
        email: '',
        address: '',
        nationalId: '',
        bloodType: undefined,
        chronicDiseases: [],
        allergies: [],
        emergencyContact: {
            name: '',
            phone: '',
            relationship: ''
        }
    };

    genders = Object.values(Gender);
    bloodTypes = Object.values(BloodType);

    chronicDiseaseInput = '';
    allergyInput = '';

    isSubmitting = false;
    successMessage = '';
    errorMessage = '';

    constructor(
        private dataService: DataService,
        private router: Router
    ) { }

    ngOnInit(): void { }

    addChronicDisease(): void {
        if (this.chronicDiseaseInput.trim()) {
            if (!this.patient.chronicDiseases) {
                this.patient.chronicDiseases = [];
            }
            this.patient.chronicDiseases.push(this.chronicDiseaseInput.trim());
            this.chronicDiseaseInput = '';
        }
    }

    removeChronicDisease(index: number): void {
        this.patient.chronicDiseases?.splice(index, 1);
    }

    addAllergy(): void {
        if (this.allergyInput.trim()) {
            if (!this.patient.allergies) {
                this.patient.allergies = [];
            }
            this.patient.allergies.push(this.allergyInput.trim());
            this.allergyInput = '';
        }
    }

    removeAllergy(index: number): void {
        this.patient.allergies?.splice(index, 1);
    }

    validateForm(): boolean {
        if (!this.patient.fullName || !this.patient.phone || !this.patient.nationalId) {
            this.errorMessage = 'Please fill in all required fields';
            return false;
        }
        if (this.patient.age && (this.patient.age < 0 || this.patient.age > 150)) {
            this.errorMessage = 'Please enter a valid age';
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

        // Simulate API call
        setTimeout(() => {
            const newPatient: Patient = {
                ...this.patient as Patient,
                id: 'PAT' + Date.now(),
                createdAt: new Date()
            };

            this.isSubmitting = false;
            this.successMessage = `Patient "${newPatient.fullName}" registered successfully!`;

            // Reset form after delay
            setTimeout(() => {
                this.resetForm();
                this.successMessage = '';
            }, 3000);
        }, 1000);
    }

    resetForm(): void {
        this.patient = {
            fullName: '',
            age: 0,
            gender: Gender.MALE,
            phone: '',
            email: '',
            address: '',
            nationalId: '',
            bloodType: undefined,
            chronicDiseases: [],
            allergies: [],
            emergencyContact: {
                name: '',
                phone: '',
                relationship: ''
            }
        };
        this.errorMessage = '';
    }
}
