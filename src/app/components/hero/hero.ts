import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroService } from '../../services/hero.service';
import { Hero } from '../../models/hero.model';
import { AuthServices } from '../../services/auth.services';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class HeroComponent implements OnInit {
  private heroService = inject(HeroService);
  private auth = inject(AuthServices);

  isLoggedIn = toSignal(
    this.auth.currentUser$.pipe(map(user => !!user)),
    { initialValue: false }
  );
  heroData = signal<Hero>({
    name: 'Jude Michael T. Arriba',
    tagline: 'Full-Stack Developer · Mobile & Web',
    bio: 'I design and build clean, scalable applications, from efficient backend APIs to refined mobile experiences.',
    profile_pic: null
  });

  ngOnInit(): void {
    this.loadHero();
  }

  loadHero(): void {
    this.heroService.getHeroData().subscribe({
      next: (data) => {
        if (data && data.name) {
          this.heroData.set(data);
          console.log('Hero data synced to UI:', this.heroData());
        }
      },
      error: (err) => console.error('Connection Error:', err)
    });
  }
  openEditModal() {
    console.log('Open Edit Hero Modal');
    // You will implement the logic to show your edit form here later
  }
}