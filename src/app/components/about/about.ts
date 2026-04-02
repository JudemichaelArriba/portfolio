import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AboutService } from '../../services/about.service';
import { About } from '../../models/about.model';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class AboutComponent implements OnInit {
  private aboutService = inject(AboutService);


  private readonly FALLBACK_ABOUT: About = {
    quote: "I build things that work well, look great, and last.",
    paragraph_1: "I'm a passionate developer...",
    paragraph_2: "My approach is pragmatic...",
    paragraph_3: "Whether it's a mobile app...",
    location: "Philippines · UTC+8",
    focus: "Full-Stack & Mobile Dev",
    education: "BS Information Technology",
    preferred_editor: "VS Code",
    work_preference: "Remote · On-site · Hybrid",
    status: "Building & Learning Daily"
  };

  aboutData = signal<About>(this.getCachedAbout());

  ngOnInit(): void {
    this.fetchAbout();
  }

  private getCachedAbout(): About {
    const cached = localStorage.getItem('cached_about');
    return cached ? JSON.parse(cached) : this.FALLBACK_ABOUT;
  }

  fetchAbout(): void {
    this.aboutService.getAboutData().subscribe({
      next: (data) => {
        if (data) {
          this.aboutData.set(data);
          localStorage.setItem('cached_about', JSON.stringify(data));
        }
      },
      error: (err) => console.error('Could not load about data', err)
    });
  }
}