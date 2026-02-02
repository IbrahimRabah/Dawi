import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../core/services/data.service';
import { Department } from '../../core/models';

@Component({
    selector: 'app-department-list',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './department-list.component.html',
    styleUrls: ['./department-list.component.scss']
})
export class DepartmentListComponent implements OnInit {
    departments: Department[] = [];
    filteredDepartments: Department[] = [];
    searchQuery = '';
    isLoading = true;
    showModal = false;
    isEditing = false;

    selectedDepartment: Partial<Department> = {};

    constructor(private dataService: DataService) { }

    ngOnInit(): void {
        this.loadDepartments();
    }

    loadDepartments(): void {
        this.dataService.getDepartments().subscribe({
            next: (depts: Department[]) => {
                this.departments = depts;
                this.filteredDepartments = depts;
                this.isLoading = false;
            },
            error: (err: any) => {
                console.error('Error loading departments:', err);
                this.isLoading = false;
            }
        });
    }

    filterDepartments(): void {
        const query = this.searchQuery.toLowerCase();
        this.filteredDepartments = this.departments.filter(d =>
            d.name.toLowerCase().includes(query) ||
            d.description.toLowerCase().includes(query) ||
            d.buildingLocation.toLowerCase().includes(query)
        );
    }

    openAddModal(): void {
        this.isEditing = false;
        this.selectedDepartment = {
            name: '',
            description: '',
            buildingLocation: '',
            icon: 'fa-hospital',
            colorCode: '#0ea5e9',
            isActive: true
        };
        this.showModal = true;
    }

    openEditModal(dept: Department): void {
        this.isEditing = true;
        this.selectedDepartment = { ...dept };
        this.showModal = true;
    }

    closeModal(): void {
        this.showModal = false;
        this.selectedDepartment = {};
    }

    saveDepartment(): void {
        // In a real app, this would call an API
        if (this.isEditing) {
            const index = this.departments.findIndex(d => d.id === this.selectedDepartment.id);
            if (index !== -1) {
                this.departments[index] = this.selectedDepartment as Department;
            }
        } else {
            const newDept: Department = {
                ...this.selectedDepartment as Department,
                id: 'DEP' + Date.now(),
                createdAt: new Date()
            };
            this.departments.push(newDept);
        }
        this.filterDepartments();
        this.closeModal();
    }

    deleteDepartment(dept: Department): void {
        if (confirm(`Are you sure you want to delete "${dept.name}"?`)) {
            this.departments = this.departments.filter(d => d.id !== dept.id);
            this.filterDepartments();
        }
    }

    toggleStatus(dept: Department): void {
        dept.isActive = !dept.isActive;
    }
}
