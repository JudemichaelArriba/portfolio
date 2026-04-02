import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators, FormControl, FormGroup } from '@angular/forms';
import { AuthServices } from '../../services/auth.services';
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
  private router = inject(Router); 

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

    if (this.auth.token) {
      this.router.navigate(['/']);
    }
  }

  toggleTheme(): void {
    this.currentTheme = this.themeService.toggleTheme();
  }

  submit(): void {
    if (this.loginForm.invalid) {
      this.dialog.error('Validation Error', 'Please check your credentials.');
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoggingIn = true;
    const { email, password } = this.loginForm.getRawValue();

    this.auth.login(email, password).subscribe({
      next: (userData) => { 
        this.isLoggingIn = false;

        this.dialog.success('Welcome', `Hello ${userData.name}`);
        this.router.navigate(['/']); 
      },
      error: (err) => {
        this.isLoggingIn = false;
      }
    });
  }
}