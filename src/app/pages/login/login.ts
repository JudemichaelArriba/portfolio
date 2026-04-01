import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators, FormControl, FormGroup } from '@angular/forms';
import { AuthServices } from '../../services/auth-services';
import { DialogService } from '../../services/dialog.service';

interface LoginFormControls {
  email: FormControl<string>;
  password: FormControl<string>;
}

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
})
export class Login implements OnInit {
  private themeService = inject(ThemeService);
  private fb = inject(NonNullableFormBuilder);
  private auth = inject(AuthServices);
  private dialog = inject(DialogService);

  currentTheme: 'dark' | 'light' = 'dark';
  loginForm: FormGroup<LoginFormControls>;

  isLoggingIn = false;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.currentTheme = this.themeService.initTheme();
  }

  toggleTheme(): void {
    this.currentTheme = this.themeService.toggleTheme();
  }

  // submit(): void {
  //   if (this.loginForm.invalid) {
  //     this.dialog.error('Validation Error', 'Please check your credentials.');
  //     this.loginForm.markAllAsTouched();
  //     return;
  //   }

  //   this.isLoggingIn = true;
  //   const { email, password } = this.loginForm.getRawValue();

  //   this.auth.login(email, password).subscribe({
  //     next: (user) => {
  //       this.isLoggingIn = false;
  //       this.dialog.success('Welcome', `Hello ${user.name}`);
  //     },
  //     error: (err) => {
  //       this.isLoggingIn = false;

      
  //       if (err.status === 0) {
  //         this.dialog.error(
  //           'Connection Error',
  //           'Unable to reach the server. Please check your internet connection or try again later.'
  //         );
  //       } else if (err.status === 401) {
  //         this.dialog.error('Unauthorized', 'Invalid email or password.');
  //       } else {
  //         this.dialog.error('Error', 'An unexpected error occurred.');
  //       }

  //       console.error('Login failed', err);
  //     }
  //   });
  // }



  submit(): void {
    if (this.loginForm.invalid) {
      this.dialog.error('Validation Error', 'Please check your credentials.');
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoggingIn = true;
    const { email, password } = this.loginForm.getRawValue();

    this.auth.login(email, password).subscribe({
      next: (userData) => { // This is now a clean User object
        this.isLoggingIn = false;
        // userData.name will now be defined!
        this.dialog.success('Welcome', `Hello ${userData.name}`);
        // Redirect if needed
      },
      error: (err) => {
        this.isLoggingIn = false;
        // Error handled in service, but we stop the spinner here
      }
    });
  }
}