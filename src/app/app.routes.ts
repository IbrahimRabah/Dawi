import { Routes } from '@angular/router';
import { authGuard, adminGuard, receptionistGuard, doctorGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    // Auth Routes
    {
        path: 'auth',
        children: [
            {
                path: 'login',
                loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
            }
        ]
    },

    // Protected Routes with Layout
    {
        path: '',
        loadComponent: () => import('./shared/components/layout/layout.component').then(m => m.LayoutComponent),
        canActivate: [authGuard],
        children: [
            // Dashboard
            {
                path: 'dashboard',
                loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
            },

            // Admin Routes
            {
                path: 'admin',
                canActivate: [adminGuard],
                children: [
                    {
                        path: 'departments',
                        loadComponent: () => import('./admin/department-list/department-list.component').then(m => m.DepartmentListComponent)
                    },
                    // {
                    //     path: 'clinics',
                    //     loadComponent: () => import('./admin/clinic-management/clinic-management.component').then(m => m.ClinicManagementComponent)
                    // },
                    {
                        path: 'shifts',
                        loadComponent: () => import('./admin/shift-management/shift-management.component').then(m => m.ShiftManagementComponent)
                    },
                    {
                        path: 'doctors',
                        loadComponent: () => import('./admin/doctor-management/doctor-management.component').then(m => m.DoctorManagementComponent)
                    }
                ]
            },

            // Reception Routes
            {
                path: 'reception',
                canActivate: [receptionistGuard],
                children: [
                    {
                        path: 'patients',
                        loadComponent: () => import('./reception/patient-list/patient-list.component').then(m => m.PatientListComponent)
                    },
                    {
                        path: 'register',
                        loadComponent: () => import('./reception/patient-registration/patient-registration.component').then(m => m.PatientRegistrationComponent)
                    },
                    {
                        path: 'appointments',
                        loadComponent: () => import('./reception/appointment-scheduling/appointment-scheduling.component').then(m => m.AppointmentSchedulingComponent)
                    },
                    {
                        path: 'queue',
                        loadComponent: () => import('./reception/queue-display/queue-display.component').then(m => m.QueueDisplayComponent)
                    }
                ]
            },

            // Doctor Routes
            {
                path: 'doctor',
                canActivate: [doctorGuard],
                children: [
                    {
                        path: 'patients',
                        loadComponent: () => import('./doctor/patient-list/patient-list.component').then(m => m.PatientListComponent)
                    },
                    {
                        path: 'records',
                        loadComponent: () => import('./doctor/medical-records/medical-records.component').then(m => m.MedicalRecordsComponent)
                    },
                    {
                        path: 'records/new/:appointmentId',
                        loadComponent: () => import('./doctor/medical-record-form/medical-record-form.component').then(m => m.MedicalRecordFormComponent)
                    },
                    {
                        path: 'schedule',
                        loadComponent: () => import('./doctor/schedule/schedule.component').then(m => m.ScheduleComponent)
                    }
                ]
            },

            // Default redirect
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    },

    // Fallback
    { path: '**', redirectTo: '/auth/login' }
];
