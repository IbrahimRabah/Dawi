// Hospital entity
export interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  logo?: string;
  createdAt: Date;
}

// Department/Specialty entity
export interface Department {
  id: string;
  name: string;
  description: string;
  buildingLocation: string;
  icon?: string;
  colorCode?: string;
  isActive: boolean;
  createdAt: Date;
}

// Clinic entity
export interface Clinic {
  id: string;
  name: string;
  departmentId: string;
  department?: Department;
  location: string;
  operatingDays: DayOfWeek[];
  isActive: boolean;
  createdAt: Date;
}

// Shift entity
export interface Shift {
  id: string;
  clinicId: string;
  clinic?: Clinic;
  type: ShiftType;
  startTime: string;
  endTime: string;
  duration: number; // in hours (4 or 8)
  dayOfWeek: DayOfWeek;
  maxPatients: number;
  isActive: boolean;
}

// Doctor entity
export interface Doctor {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  age: number;
  address: string;
  specialtyId: string;
  specialty?: Department;
  status: DoctorStatus;
  avatar?: string;
  licenseNumber: string;
  yearsOfExperience: number;
  createdAt: Date;
}

// Doctor-Shift Assignment
export interface DoctorShift {
  id: string;
  doctorId: string;
  doctor?: Doctor;
  shiftId: string;
  shift?: Shift;
  assignedDate: Date;
  isActive: boolean;
}

// Patient entity
export interface Patient {
  id: string;
  fullName: string;
  age: number;
  gender: Gender;
  phone: string;
  email?: string;
  address: string;
  nationalId: string;
  bloodType?: BloodType;
  chronicDiseases: string[];
  allergies?: string[];
  emergencyContact?: EmergencyContact;
  createdAt: Date;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

// Appointment entity
export interface Appointment {
  id: string;
  patientId: string;
  patient?: Patient;
  departmentId: string;
  department?: Department;
  clinicId: string;
  clinic?: Clinic;
  doctorId: string;
  doctor?: Doctor;
  shiftId: string;
  shift?: Shift;
  queueNumber: number;
  visitDate: Date;
  status: AppointmentStatus;
  notes?: string;
  createdAt: Date;
  createdBy?: string;
}

// Medical Record entity
export interface MedicalRecord {
  id: string;
  patientId: string;
  patient?: Patient;
  appointmentId: string;
  appointment?: Appointment;
  doctorId: string;
  doctor?: Doctor;
  diagnosis: string;
  symptoms: string[];
  notes: string;
  prescription: Prescription[];
  vitals?: VitalSigns;
  visitDate: Date;
  createdAt: Date;
}

export interface Prescription {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
}

export interface VitalSigns {
  bloodPressure?: string;
  heartRate?: number;
  temperature?: number;
  weight?: number;
  height?: number;
  oxygenSaturation?: number;
}

// User entity for authentication
export interface User {
  id: string;
  username: string;
  email: string;
  password?: string;
  fullName: string;
  role: UserRole;
  departmentId?: string;
  doctorId?: string;
  avatar?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
}

// Enums
export enum DayOfWeek {
  SUNDAY = 'SUNDAY',
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY'
}

export enum ShiftType {
  AM = 'AM',
  PM = 'PM',
  FULL_DAY = 'FULL_DAY'
}

export enum DoctorStatus {
  ACTIVE = 'ACTIVE',
  ON_LEAVE = 'ON_LEAVE',
  INACTIVE = 'INACTIVE'
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE'
}

export enum BloodType {
  A_POSITIVE = 'A+',
  A_NEGATIVE = 'A-',
  B_POSITIVE = 'B+',
  B_NEGATIVE = 'B-',
  AB_POSITIVE = 'AB+',
  AB_NEGATIVE = 'AB-',
  O_POSITIVE = 'O+',
  O_NEGATIVE = 'O-'
}

export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  WAITING = 'WAITING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW'
}

export enum UserRole {
  ADMIN = 'ADMIN',
  DEPARTMENT_HEAD = 'DEPARTMENT_HEAD',
  DOCTOR = 'DOCTOR',
  RECEPTIONIST = 'RECEPTIONIST'
}

// Dashboard Statistics
export interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  activeDoctors: number;
  waitingPatients: number;
  completedToday: number;
  departments: number;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}
