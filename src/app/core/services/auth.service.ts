import { Injectable, inject, Injector } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User, UserRole } from '../models';
import { DataService } from './data.service';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

    currentUser$ = this.currentUserSubject.asObservable();
    isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
    
    private injector = inject(Injector);

    constructor() {
        this.checkStoredAuth();
    }

    private checkStoredAuth(): void {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            const user = JSON.parse(storedUser) as User;
            this.currentUserSubject.next(user);
            this.isAuthenticatedSubject.next(true);
        }
    }

    login(username: string, password: string): Observable<{ success: boolean; message: string; user?: User }> {
        const dataService = this.injector.get(DataService);
        return dataService.getUsers().pipe(
            map(users => {
                const user = users.find(u =>
                    u.username === username &&
                    u.password === password &&
                    u.isActive
                );

                if (user) {
                    const userWithoutPassword = { ...user, password: undefined };
                    localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
                    this.currentUserSubject.next(userWithoutPassword);
                    this.isAuthenticatedSubject.next(true);
                    return { success: true, message: 'Login successful', user: userWithoutPassword };
                }

                return { success: false, message: 'Invalid username or password' };
            })
        );
    }

    logout(): void {
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
        this.isAuthenticatedSubject.next(false);
    }

    getCurrentUser(): User | null {
        return this.currentUserSubject.value;
    }

    isAuthenticated(): boolean {
        return this.isAuthenticatedSubject.value;
    }

    hasRole(role: UserRole): boolean {
        const user = this.getCurrentUser();
        return user?.role === role;
    }

    hasAnyRole(roles: UserRole[]): boolean {
        const user = this.getCurrentUser();
        return user ? roles.includes(user.role) : false;
    }

    isAdmin(): boolean {
        return this.hasRole(UserRole.ADMIN);
    }

    isDoctor(): boolean {
        return this.hasRole(UserRole.DOCTOR);
    }

    isReceptionist(): boolean {
        return this.hasRole(UserRole.RECEPTIONIST);
    }

    isDepartmentHead(): boolean {
        return this.hasRole(UserRole.DEPARTMENT_HEAD);
    }
}
