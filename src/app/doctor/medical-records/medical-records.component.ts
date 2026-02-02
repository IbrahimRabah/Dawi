import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../core/services/data.service';
import { AuthService } from '../../core/services/auth.service';
import { MedicalRecord } from '../../core/models';

@Component({
    selector: 'app-medical-records',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './medical-records.component.html',
    styleUrls: ['./medical-records.component.scss']
})
export class MedicalRecordsComponent implements OnInit {
    records: MedicalRecord[] = [];
    filteredRecords: MedicalRecord[] = [];
    searchQuery = '';
    isLoading = true;
    selectedRecord: MedicalRecord | null = null;

    constructor(
        private dataService: DataService,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.loadRecords();
    }

    loadRecords(): void {
        this.dataService.getMedicalRecords().subscribe({
            next: (records: MedicalRecord[]) => {
                const user = this.authService.getCurrentUser();
                // Filter by doctor if applicable
                this.records = user?.doctorId
                    ? records.filter((r: MedicalRecord) => r.doctorId === user.doctorId)
                    : records;
                this.filteredRecords = this.records;
                this.isLoading = false;
            },
            error: () => this.isLoading = false
        });
    }

    applyFilter(): void {
        if (!this.searchQuery) {
            this.filteredRecords = this.records;
            return;
        }
        const query = this.searchQuery.toLowerCase();
        this.filteredRecords = this.records.filter(r =>
            r.patient?.fullName.toLowerCase().includes(query) ||
            r.diagnosis.toLowerCase().includes(query)
        );
    }

    viewRecord(record: MedicalRecord): void {
        this.selectedRecord = record;
    }

    closeModal(): void {
        this.selectedRecord = null;
    }
}
