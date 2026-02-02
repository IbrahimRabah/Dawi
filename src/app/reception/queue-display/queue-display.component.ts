import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../core/services';
import { Appointment, AppointmentStatus } from '../../core/models';

@Component({
    selector: 'app-queue-display',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './queue-display.component.html',
    styleUrls: ['./queue-display.component.scss']
})
export class QueueDisplayComponent implements OnInit, OnDestroy {
    appointments: Appointment[] = [];
    waitingAppointments: Appointment[] = [];
    inProgressAppointments: Appointment[] = [];
    currentTime = new Date();
    private timeInterval: any;

    AppointmentStatus = AppointmentStatus;

    constructor(private dataService: DataService) { }

    ngOnInit(): void {
        this.loadAppointments();
        this.startClock();
    }

    ngOnDestroy(): void {
        if (this.timeInterval) {
            clearInterval(this.timeInterval);
        }
    }

    private startClock(): void {
        this.timeInterval = setInterval(() => {
            this.currentTime = new Date();
        }, 1000);
    }

    loadAppointments(): void {
        this.dataService.getAppointments().subscribe((appointments: Appointment[]) => {
            const today = new Date().toDateString();

            // Filter today's appointments
            this.appointments = appointments.filter((a: Appointment) => {
                const aptDate = new Date(a.visitDate).toDateString();
                return aptDate === today;
            });

            this.waitingAppointments = this.appointments
                .filter(a => a.status === AppointmentStatus.WAITING)
                .sort((a, b) => a.queueNumber - b.queueNumber);

            this.inProgressAppointments = this.appointments
                .filter(a => a.status === AppointmentStatus.IN_PROGRESS);
        });
    }

    callNext(): void {
        if (this.waitingAppointments.length > 0) {
            const next = this.waitingAppointments[0];
            next.status = AppointmentStatus.IN_PROGRESS;
            this.loadAppointments();
        }
    }

    markComplete(apt: Appointment): void {
        apt.status = AppointmentStatus.COMPLETED;
        this.loadAppointments();
    }

    getStatusClass(status: string): string {
        const classes: Record<string, string> = {
            'WAITING': 'status-waiting',
            'IN_PROGRESS': 'status-progress',
            'COMPLETED': 'status-complete'
        };
        return classes[status] || '';
    }

    getCompletedCount(): number {
        return this.appointments.filter(a => a.status === AppointmentStatus.COMPLETED).length;
    }
}
