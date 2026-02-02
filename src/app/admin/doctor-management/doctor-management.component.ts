import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../core/services';
import { Doctor, Department, DoctorStatus } from '../../core/models';

@Component({
    selector: 'app-doctor-management',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './doctor-management.component.html',
    styleUrls: ['./doctor-management.component.scss']
})
export class DoctorManagementComponent implements OnInit {
    doctors: Doctor[] = [];
    filteredDoctors: Doctor[] = [];
    departments: Department[] = [];
    searchQuery = '';
    filterDepartment = '';
    filterStatus = '';
    isLoading = true;
    showModal = false;
    isEditing = false;

    selectedDoctor: Partial<Doctor> = {};
    DoctorStatus = DoctorStatus;

    constructor(private dataService: DataService) { }

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
        this.dataService.getDepartments().subscribe((depts: Department[]) => {
            this.departments = depts;
        });

        this.dataService.getDoctors().subscribe({
            next: (docs: Doctor[]) => {
                this.doctors = docs;
                this.filteredDoctors = docs;
                this.isLoading = false;
            },
            error: (err: any) => {
                console.error('Error loading doctors:', err);
                this.isLoading = false;
            }
        });
    }

    applyFilters(): void {
        let result = [...this.doctors];

        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            result = result.filter(d =>
                d.fullName.toLowerCase().includes(query) ||
                d.email.toLowerCase().includes(query) ||
                d.phone.includes(query)
            );
        }

        if (this.filterDepartment) {
            result = result.filter(d => d.specialtyId === this.filterDepartment);
        }

        if (this.filterStatus) {
            result = result.filter(d => d.status === this.filterStatus);
        }

        this.filteredDoctors = result;
    }

    openAddModal(): void {
        this.isEditing = false;
        this.selectedDoctor = {
            fullName: '',
            email: '',
            phone: '',
            age: 30,
            address: '',
            specialtyId: '',
            status: DoctorStatus.ACTIVE,
            licenseNumber: '',
            yearsOfExperience: 0
        };
        this.showModal = true;
    }

    openEditModal(doctor: Doctor): void {
        this.isEditing = true;
        this.selectedDoctor = { ...doctor };
        this.showModal = true;
    }

    closeModal(): void {
        this.showModal = false;
        this.selectedDoctor = {};
    }

    saveDoctor(): void {
        if (this.isEditing) {
            const index = this.doctors.findIndex(d => d.id === this.selectedDoctor.id);
            if (index !== -1) {
                this.doctors[index] = {
                    ...this.doctors[index],
                    ...this.selectedDoctor as Doctor,
                    specialty: this.departments.find(d => d.id === this.selectedDoctor.specialtyId)
                };
            }
        } else {
            const newDoctor: Doctor = {
                ...this.selectedDoctor as Doctor,
                id: 'DOC' + Date.now(),
                createdAt: new Date(),
                specialty: this.departments.find(d => d.id === this.selectedDoctor.specialtyId)
            };
            this.doctors.push(newDoctor);
        }
        this.applyFilters();
        this.closeModal();
    }

    deleteDoctor(doctor: Doctor): void {
        if (confirm(`Are you sure you want to delete "${doctor.fullName}"?`)) {
            this.doctors = this.doctors.filter(d => d.id !== doctor.id);
            this.applyFilters();
        }
    }

    updateStatus(doctor: Doctor, status: DoctorStatus): void {
        doctor.status = status;
    }

    getStatusClass(status: string): string {
        const statusClasses: Record<string, string> = {
            'ACTIVE': 'badge-success',
            'ON_LEAVE': 'badge-warning',
            'INACTIVE': 'badge-danger'
        };
        return statusClasses[status] || 'badge-info';
    }

    getActiveCount(): number {
        return this.doctors.filter(d => d.status === DoctorStatus.ACTIVE).length;
    }

    getOnLeaveCount(): number {
        return this.doctors.filter(d => d.status === DoctorStatus.ON_LEAVE).length;
    }
}
