import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DataService } from '../../core/services';
import { Patient } from '../../core/models';

@Component({
    selector: 'app-patient-list',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './patient-list.component.html',
    styleUrls: ['./patient-list.component.scss']
})
export class PatientListComponent implements OnInit {
    patients: Patient[] = [];
    filteredPatients: Patient[] = [];
    searchQuery = '';
    isLoading = true;

    constructor(private dataService: DataService) { }

    ngOnInit(): void {
        this.loadPatients();
    }

    loadPatients(): void {
        this.dataService.getPatients().subscribe({
            next: (patients: Patient[]) => {
                this.patients = patients;
                this.filteredPatients = patients;
                this.isLoading = false;
            },
            error: () => this.isLoading = false
        });
    }

    applyFilter(): void {
        if (!this.searchQuery) {
            this.filteredPatients = this.patients;
            return;
        }
        const query = this.searchQuery.toLowerCase();
        this.filteredPatients = this.patients.filter(p =>
            p.fullName.toLowerCase().includes(query) ||
            p.phone.includes(query) ||
            p.nationalId.toLowerCase().includes(query)
        );
    }
}
