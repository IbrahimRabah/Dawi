import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import {
    Hospital,
    Department,
    Clinic,
    Shift,
    Doctor,
    Patient,
    Appointment,
    MedicalRecord,
    User,
    DoctorShift
} from '../models';

interface DatabaseSchema {
    hospital: Hospital;
    departments: Department[];
    clinics: Clinic[];
    shifts: Shift[];
    doctors: Doctor[];
    doctorShifts: DoctorShift[];
    patients: Patient[];
    appointments: Appointment[];
    medicalRecords: MedicalRecord[];
    users: User[];
}

@Injectable({
    providedIn: 'root'
})
export class DataService {
    private readonly dataUrl = 'assets/data/db.json';
    private dataCache: DatabaseSchema | null = null;
    private dataLoaded$ = new BehaviorSubject<boolean>(false);

    constructor(private http: HttpClient) {
        this.loadData();
    }

    private loadData(): void {
        this.http.get<DatabaseSchema>(this.dataUrl).subscribe({
            next: (data) => {
                this.dataCache = data;
                this.dataLoaded$.next(true);
            },
            error: (err) => console.error('Error loading data:', err)
        });
    }

    isDataLoaded(): Observable<boolean> {
        return this.dataLoaded$.asObservable();
    }

    // Hospital
    getHospital(): Observable<Hospital | null> {
        return this.getData().pipe(map(data => data?.hospital || null));
    }

    // Departments
    getDepartments(): Observable<Department[]> {
        return this.getData().pipe(map(data => data?.departments || []));
    }

    getDepartmentById(id: string): Observable<Department | undefined> {
        return this.getDepartments().pipe(
            map(departments => departments.find(d => d.id === id))
        );
    }

    // Clinics
    getClinics(): Observable<Clinic[]> {
        return this.getData().pipe(
            map(data => {
                const clinics = data?.clinics || [];
                const departments = data?.departments || [];
                return clinics.map(clinic => ({
                    ...clinic,
                    department: departments.find(d => d.id === clinic.departmentId)
                }));
            })
        );
    }

    getClinicsByDepartment(departmentId: string): Observable<Clinic[]> {
        return this.getClinics().pipe(
            map(clinics => clinics.filter(c => c.departmentId === departmentId))
        );
    }

    getClinicById(id: string): Observable<Clinic | undefined> {
        return this.getClinics().pipe(
            map(clinics => clinics.find(c => c.id === id))
        );
    }

    // Shifts
    getShifts(): Observable<Shift[]> {
        return this.getData().pipe(
            map(data => {
                const shifts = data?.shifts || [];
                const clinics = data?.clinics || [];
                return shifts.map(shift => ({
                    ...shift,
                    clinic: clinics.find(c => c.id === shift.clinicId)
                }));
            })
        );
    }

    getShiftsByClinic(clinicId: string): Observable<Shift[]> {
        return this.getShifts().pipe(
            map(shifts => shifts.filter(s => s.clinicId === clinicId))
        );
    }

    getShiftById(id: string): Observable<Shift | undefined> {
        return this.getShifts().pipe(
            map(shifts => shifts.find(s => s.id === id))
        );
    }

    // Doctors
    getDoctors(): Observable<Doctor[]> {
        return this.getData().pipe(
            map(data => {
                const doctors = data?.doctors || [];
                const departments = data?.departments || [];
                return doctors.map(doctor => ({
                    ...doctor,
                    specialty: departments.find(d => d.id === doctor.specialtyId)
                }));
            })
        );
    }

    getDoctorsByDepartment(departmentId: string): Observable<Doctor[]> {
        return this.getDoctors().pipe(
            map(doctors => doctors.filter(d => d.specialtyId === departmentId))
        );
    }

    getDoctorById(id: string): Observable<Doctor | undefined> {
        return this.getDoctors().pipe(
            map(doctors => doctors.find(d => d.id === id))
        );
    }

    getActiveDoctors(): Observable<Doctor[]> {
        return this.getDoctors().pipe(
            map(doctors => doctors.filter(d => d.status === 'ACTIVE'))
        );
    }

    // Doctor Shifts
    getDoctorShifts(doctorId?: string): Observable<DoctorShift[]> {
        return this.getData().pipe(
            map(data => {
                const doctorShifts = data?.doctorShifts || [];
                const shifts = data?.shifts || [];
                const clinics = data?.clinics || [];

                let result = doctorShifts.map(ds => {
                    const shift = shifts.find(s => s.id === ds.shiftId);
                    return {
                        ...ds,
                        shift: shift ? {
                            ...shift,
                            clinic: clinics.find(c => c.id === shift.clinicId)
                        } : undefined
                    } as DoctorShift;
                });

                if (doctorId) {
                    result = result.filter(ds => ds.doctorId === doctorId);
                }

                return result;
            })
        );
    }

    getDoctorsByShift(shiftId: string): Observable<Doctor[]> {
        return this.getData().pipe(
            map(data => {
                const doctorShifts = data?.doctorShifts || [];
                const doctors = data?.doctors || [];
                const assignedDoctorIds = doctorShifts
                    .filter(ds => ds.shiftId === shiftId && ds.isActive)
                    .map(ds => ds.doctorId);
                return doctors.filter(d => assignedDoctorIds.includes(d.id));
            })
        );
    }

    // Patients
    getPatients(): Observable<Patient[]> {
        return this.getData().pipe(map(data => data?.patients || []));
    }

    getPatientById(id: string): Observable<Patient | undefined> {
        return this.getPatients().pipe(
            map(patients => patients.find(p => p.id === id))
        );
    }

    searchPatients(query: string): Observable<Patient[]> {
        const lowerQuery = query.toLowerCase();
        return this.getPatients().pipe(
            map(patients => patients.filter(p =>
                p.fullName.toLowerCase().includes(lowerQuery) ||
                p.phone.includes(query) ||
                p.nationalId.toLowerCase().includes(lowerQuery)
            ))
        );
    }

    // Appointments
    getAppointments(): Observable<Appointment[]> {
        return this.getData().pipe(
            map(data => {
                const appointments = data?.appointments || [];
                const patients = data?.patients || [];
                const departments = data?.departments || [];
                const clinics = data?.clinics || [];
                const doctors = data?.doctors || [];
                const shifts = data?.shifts || [];

                return appointments.map(apt => ({
                    ...apt,
                    patient: patients.find(p => p.id === apt.patientId),
                    department: departments.find(d => d.id === apt.departmentId),
                    clinic: clinics.find(c => c.id === apt.clinicId),
                    doctor: doctors.find(d => d.id === apt.doctorId),
                    shift: shifts.find(s => s.id === apt.shiftId)
                }));
            })
        );
    }

    getAppointmentById(id: string): Observable<Appointment | undefined> {
        return this.getAppointments().pipe(
            map(appointments => appointments.find(a => a.id === id))
        );
    }

    getAppointmentsByPatient(patientId: string): Observable<Appointment[]> {
        return this.getAppointments().pipe(
            map(appointments => appointments.filter(a => a.patientId === patientId))
        );
    }

    getAppointmentsByDoctor(doctorId: string): Observable<Appointment[]> {
        return this.getAppointments().pipe(
            map(appointments => appointments.filter(a => a.doctorId === doctorId))
        );
    }

    getTodayAppointments(): Observable<Appointment[]> {
        const today = new Date().toISOString().split('T')[0];
        return this.getAppointments().pipe(
            map(appointments => appointments.filter(a => {
                const aptDate = new Date(a.visitDate).toISOString().split('T')[0];
                return aptDate === today;
            }))
        );
    }

    getWaitingAppointments(): Observable<Appointment[]> {
        return this.getAppointments().pipe(
            map(appointments => appointments.filter(a => a.status === 'WAITING'))
        );
    }

    // Medical Records
    getMedicalRecords(): Observable<MedicalRecord[]> {
        return this.getData().pipe(
            map(data => {
                const records = data?.medicalRecords || [];
                const patients = data?.patients || [];
                const doctors = data?.doctors || [];
                const appointments = data?.appointments || [];

                return records.map(record => ({
                    ...record,
                    patient: patients.find(p => p.id === record.patientId),
                    doctor: doctors.find(d => d.id === record.doctorId),
                    appointment: appointments.find(a => a.id === record.appointmentId)
                }));
            })
        );
    }

    getMedicalRecordsByPatient(patientId: string): Observable<MedicalRecord[]> {
        return this.getMedicalRecords().pipe(
            map(records => records.filter(r => r.patientId === patientId))
        );
    }

    // Users
    getUsers(): Observable<User[]> {
        return this.getData().pipe(map(data => data?.users || []));
    }

    getUserByUsername(username: string): Observable<User | undefined> {
        return this.getUsers().pipe(
            map(users => users.find(u => u.username === username))
        );
    }

    // Helper
    private getData(): Observable<DatabaseSchema | null> {
        if (this.dataCache) {
            return of(this.dataCache);
        }
        return this.http.get<DatabaseSchema>(this.dataUrl).pipe(
            tap(data => this.dataCache = data)
        );
    }
}

