import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { User, UserRole } from '../../../core/models';

interface NavItem {
    label: string;
    icon: string;
    route: string;
    roles: UserRole[];
}

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
    currentUser: User | null = null;
    isCollapsed = false;
    currentTime = new Date();

    navItems: NavItem[] = [
        {
            label: 'Dashboard',
            icon: 'fa-solid fa-gauge-high',
            route: '/dashboard',
            roles: [UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST, UserRole.DEPARTMENT_HEAD]
        },
        {
            label: 'Departments',
            icon: 'fa-solid fa-building-columns',
            route: '/admin/departments',
            roles: [UserRole.ADMIN]
        },
        {
            label: 'Clinics',
            icon: 'fa-solid fa-hospital',
            route: '/admin/clinics',
            roles: [UserRole.ADMIN]
        },
        {
            label: 'Shifts',
            icon: 'fa-solid fa-clock',
            route: '/admin/shifts',
            roles: [UserRole.ADMIN, UserRole.DEPARTMENT_HEAD]
        },
        {
            label: 'Doctors',
            icon: 'fa-solid fa-user-doctor',
            route: '/admin/doctors',
            roles: [UserRole.ADMIN, UserRole.DEPARTMENT_HEAD]
        },
        {
            label: 'Patients',
            icon: 'fa-solid fa-hospital-user',
            route: '/reception/patients',
            roles: [UserRole.ADMIN, UserRole.RECEPTIONIST]
        },
        {
            label: 'Registration',
            icon: 'fa-solid fa-user-plus',
            route: '/reception/register',
            roles: [UserRole.ADMIN, UserRole.RECEPTIONIST]
        },
        {
            label: 'Appointments',
            icon: 'fa-solid fa-calendar-check',
            route: '/reception/appointments',
            roles: [UserRole.ADMIN, UserRole.RECEPTIONIST]
        },
        {
            label: 'Queue Display',
            icon: 'fa-solid fa-list-ol',
            route: '/reception/queue',
            roles: [UserRole.ADMIN, UserRole.RECEPTIONIST]
        },
        {
            label: 'My Patients',
            icon: 'fa-solid fa-bed-pulse',
            route: '/doctor/patients',
            roles: [UserRole.DOCTOR]
        },
        {
            label: 'Medical Records',
            icon: 'fa-solid fa-file-medical',
            route: '/doctor/records',
            roles: [UserRole.DOCTOR]
        },
        {
            label: 'My Schedule',
            icon: 'fa-solid fa-calendar-days',
            route: '/doctor/schedule',
            roles: [UserRole.DOCTOR]
        }
    ];

    constructor(private authService: AuthService) { }

    ngOnInit(): void {
        this.authService.currentUser$.subscribe(user => {
            this.currentUser = user;
        });

        // Update clock
        setInterval(() => {
            this.currentTime = new Date();
        }, 1000);
    }

    get filteredNavItems(): NavItem[] {
        if (!this.currentUser) return [];
        return this.navItems.filter(item => item.roles.includes(this.currentUser!.role));
    }

    toggleSidebar(): void {
        this.isCollapsed = !this.isCollapsed;
    }

    logout(): void {
        this.authService.logout();
    }

    getRoleLabel(role: UserRole): string {
        const labels: Record<UserRole, string> = {
            [UserRole.ADMIN]: 'Administrator',
            [UserRole.DOCTOR]: 'Doctor',
            [UserRole.RECEPTIONIST]: 'Receptionist',
            [UserRole.DEPARTMENT_HEAD]: 'Department Head'
        };
        return labels[role] || role;
    }
}
