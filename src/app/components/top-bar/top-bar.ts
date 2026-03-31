import { Component, OnInit } from '@angular/core';
import { ThemeService } from '../../services/theme.service/theme.service';


@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [],
  templateUrl: './top-bar.html',
  styleUrl: './top-bar.css',
})
export class TopBar implements OnInit {
  constructor(private theme: ThemeService) { }

  ngOnInit(): void {
    this.theme.initTheme();
  }

  toggleTheme(): void {
    this.theme.toggleTheme();
  }
}
