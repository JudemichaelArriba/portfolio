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
  imports: [CommonModule, ReactiveFormsModule], // CommonModule is needed for classes/pipes
  templateUrl: './login.html',
})
export class Login implements OnInit {
  private themeService = inject(ThemeService);
  private fb = inject(NonNullableFormBuilder); 
  private auth = inject(AuthServices);
  private dialog = inject(DialogService);

  currentTheme: 'dark' | 'light' = 'dark';
  loginForm: FormGroup<LoginFormControls>;
  
  // Track loading state
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

  submit(): void {
    if (this.loginForm.invalid) {
      this.dialog.error('Validation Error', 'Please fill in all fields correctly.');
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoggingIn = true;
    const { email, password } = this.loginForm.getRawValue();

    this.auth.login(email, password).subscribe({
      next: (user) => {
        this.isLoggingIn = false;
        this.dialog.success('Welcome', `Hello ${user.name}`);
      },
      error: (err) => {
        this.isLoggingIn = false;
        // Logic for your specific Firebase errors can go here
        console.error('Login failed', err);
      }
    });
  }
}