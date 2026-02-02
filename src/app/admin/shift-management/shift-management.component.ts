import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../core/services/data.service';
import { Clinic, Department, Shift, ShiftType, DayOfWeek } from '../../core/models';

@Component({
    selector: 'app-shift-management',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './shift-management.component.html',
    styleUrls: ['./shift-management.component.scss']
})
export class ShiftManagementComponent implements OnInit {
    shifts: Shift[] = [];
    clinics: Clinic[] = [];
    departments: Department[] = [];

    searchQuery = '';
    filterClinic = '';
    filteredShifts: Shift[] = [];

    isLoading = true;
    showModal = false;
    isEditing = false;

    selectedShift: Partial<Shift> = {};
    shiftTypes = Object.values(ShiftType);
    daysOfWeek = Object.values(DayOfWeek);

    constructor(private dataService: DataService) { }

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
        this.dataService.getDepartments().subscribe((d: Department[]) => this.departments = d);
        this.dataService.getClinics().subscribe((c: Clinic[]) => this.clinics = c);
        this.dataService.getShifts().subscribe({
            next: (shifts: Shift[]) => {
                this.shifts = shifts;
                this.filteredShifts = shifts;
                this.isLoading = false;
            },
            error: () => this.isLoading = false
        });
    }

    applyFilters(): void {
        let result = [...this.shifts];

        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            result = result.filter(s =>
                s.type.toLowerCase().includes(query) ||
                s.dayOfWeek.toLowerCase().includes(query)
            );
        }

        if (this.filterClinic) {
            result = result.filter(s => s.clinicId === this.filterClinic);
        }

        this.filteredShifts = result;
    }

    openAddModal(): void {
        this.isEditing = false;
        this.selectedShift = {
            clinicId: '',
            type: ShiftType.AM,
            dayOfWeek: DayOfWeek.MONDAY,
            startTime: '08:00',
            endTime: '12:00',
            maxPatients: 20,
            isActive: true
        };
        this.showModal = true;
    }

    openEditModal(shift: Shift): void {
        this.isEditing = true;
        this.selectedShift = { ...shift };
        this.showModal = true;
    }

    closeModal(): void {
        this.showModal = false;
        this.selectedShift = {};
    }

    saveShift(): void {
        if (this.isEditing) {
            const index = this.shifts.findIndex(s => s.id === this.selectedShift.id);
            if (index !== -1) {
                this.shifts[index] = {
                    ...this.shifts[index],
                    ...this.selectedShift as Shift,
                    clinic: this.clinics.find(c => c.id === this.selectedShift.clinicId)
                };
            }
        } else {
            const newShift: Shift = {
                ...this.selectedShift as Shift,
                id: 'SH' + Date.now(),
                clinic: this.clinics.find(c => c.id === this.selectedShift.clinicId)
            };
            this.shifts.push(newShift);
        }
        this.applyFilters();
        this.closeModal();
    }

    deleteShift(shift: Shift): void {
        if (confirm(`Are you sure you want to delete this shift?`)) {
            this.shifts = this.shifts.filter(s => s.id !== shift.id);
            this.applyFilters();
        }
    }

    toggleActive(shift: Shift): void {
        shift.isActive = !shift.isActive;
    }
}
