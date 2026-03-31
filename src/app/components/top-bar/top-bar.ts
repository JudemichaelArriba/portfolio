import { Component, OnInit } from '@angular/core';
import { ThemeService } from '../../services/theme.service/theme.service';

type Theme = 'dark' | 'light';


@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [],
  templateUrl: './top-bar.html',
  styleUrl: './top-bar.css',
})
export class TopBar implements OnInit {
  themeMode: Theme = 'dark';

  constructor(private theme: ThemeService) { }

  ngOnInit(): void {
    this.themeMode = this.theme.initTheme();
  }

  toggleTheme(): void {
    this.themeMode = this.theme.toggleTheme();
  }
}
