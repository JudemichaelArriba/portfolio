// admin-login.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service/theme.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.html',
})
export class Login implements OnInit {
  currentTheme: 'dark' | 'light' = 'dark';

  constructor(private themeService: ThemeService) { }

  ngOnInit(): void {
    this.currentTheme = this.themeService.initTheme();
  }

  toggleTheme(): void {
    this.currentTheme = this.themeService.toggleTheme();
  }
}