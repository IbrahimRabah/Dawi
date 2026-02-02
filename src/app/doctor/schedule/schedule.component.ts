import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../core/services/data.service';
import { AuthService } from '../../core/services/auth.service';
import { DoctorShift, DayOfWeek } from '../../core/models';

@Component({
    selector: 'app-schedule',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './schedule.component.html',
    styleUrls: ['./schedule.component.scss']
})
export class ScheduleComponent implements OnInit {
    doctorShifts: DoctorShift[] = [];
    weekDays = Object.values(DayOfWeek);
    isLoading = true;

    constructor(
        private dataService: DataService,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.loadSchedule();
    }

    loadSchedule(): void {
        const user = this.authService.getCurrentUser();
        if (user?.doctorId) {
            this.dataService.getDoctorShifts(user.doctorId).subscribe({
                next: (shifts: DoctorShift[]) => {
                    this.doctorShifts = shifts;
                    this.isLoading = false;
                },
                error: () => this.isLoading = false
            });
        } else {
            this.isLoading = false;
        }
    }

    getShiftsForDay(day: string): DoctorShift[] {
        return this.doctorShifts.filter(ds => ds.shift?.dayOfWeek === day);
    }

    getTodayHighlight(day: string): boolean {
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
        return day === today;
    }
}
