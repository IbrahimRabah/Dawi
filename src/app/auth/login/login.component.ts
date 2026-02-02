import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    username = '';
    password = '';
    errorMessage = '';
    isLoading = false;
    showPassword = false;
    returnUrl = '/dashboard';

    constructor(
        private authService: AuthService,
        private router: Router,
        private route: ActivatedRoute
    ) { }

    ngOnInit(): void {
        // Check if already logged in
        if (this.authService.isAuthenticated()) {
            this.router.navigate(['/dashboard']);
            return;
        }

        // Get return URL
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    }

    onSubmit(): void {
        if (!this.username || !this.password) {
            this.errorMessage = 'Please enter both username and password';
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';

        this.authService.login(this.username, this.password).subscribe({
            next: (result: { success: boolean; message: string; user?: any }) => {
                this.isLoading = false;
                if (result.success) {
                    this.router.navigate([this.returnUrl]);
                } else {
                    this.errorMessage = result.message;
                }
            },
            error: (err: any) => {
                this.isLoading = false;
                this.errorMessage = 'An error occurred. Please try again.';
                console.error('Login error:', err);
            }
        });
    }

    togglePasswordVisibility(): void {
        this.showPassword = !this.showPassword;
    }
}
