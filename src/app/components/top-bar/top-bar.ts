import { Component, OnInit, AfterViewInit, OnDestroy, NgZone, ChangeDetectorRef, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription, filter, map } from 'rxjs';
import { ThemeService } from '../../services/theme.service';
import { RouterLink } from '@angular/router';
import { AuthServices } from '../../services/auth.services'; // 1. Import Auth
import { toSignal } from '@angular/core/rxjs-interop'; // 2. Import toSignal
import { DialogService } from '../../services/dialog.service'; // 3. Import Dialog

type Theme = 'dark' | 'light';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './top-bar.html',
  styleUrl: './top-bar.css',
})
export class TopBar implements OnInit, AfterViewInit, OnDestroy {
  activeSection = 'hero';
  themeMode: Theme = 'dark';
  
  // 4. Inject Services
  private auth = inject(AuthServices);
  private dialog = inject(DialogService);
  
  // 5. Create a Signal for the Auth state
  isLoggedIn = toSignal(
    this.auth.currentUser$.pipe(map(user => !!user)), 
    { initialValue: !!this.auth.token }
  );

  private observer: IntersectionObserver | null = null;
  private routerSub?: Subscription;
  private scrollCleanup?: () => void;
  private scrollRaf = 0;
  private sections: HTMLElement[] = [];
  private initAttempts = 0;

  constructor(
    private theme: ThemeService,
    private router: Router,
    private zone: NgZone,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.themeMode = this.theme.initTheme();
  }

  // 6. Production Logout Logic with Dialog
  handleLogout(): void {
    this.dialog.confirm(
      'Sign Out',
      'Are you sure you want to log out of the admin portal?',
      () => {
        this.auth.logout();
        this.router.navigate(['/']); // Go home after logout
      },
      undefined,
      'Logout',
      'Stay'
    );
  }

  toggleTheme(): void {
    this.themeMode = this.theme.toggleTheme();
  }

  // ... rest of your existing intersection observer code remains unchanged ...
  ngAfterViewInit(): void {
    setTimeout(() => this.setupObserver(), 0);
    this.routerSub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        setTimeout(() => this.setupObserver(), 0);
      });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.routerSub?.unsubscribe();
    this.scrollCleanup?.();
    if (this.scrollRaf) cancelAnimationFrame(this.scrollRaf);
  }

  private setupObserver(): void {
    if (this.observer) this.observer.disconnect();
    if (this.scrollCleanup) {
      this.scrollCleanup();
      this.scrollCleanup = undefined;
    }

    this.sections = Array.from(document.querySelectorAll('section[id]')) as HTMLElement[];
    if (!this.sections.length) {
      if (this.initAttempts < 20) {
        this.initAttempts++;
        setTimeout(() => this.setupObserver(), 50);
      }
      return;
    }
    this.initAttempts = 0;

    this.observer = new IntersectionObserver(
      () => this.updateActiveSection(),
      { rootMargin: '-40% 0px -55% 0px', threshold: 0.1 }
    );

    this.sections.forEach(section => this.observer!.observe(section));

    this.zone.runOutsideAngular(() => {
      const update = () => this.updateActiveSection();
      const onScroll = () => {
        if (this.scrollRaf) cancelAnimationFrame(this.scrollRaf);
        this.scrollRaf = requestAnimationFrame(update);
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
      onScroll();
      this.scrollCleanup = () => {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
      };
    });
  }

  private updateActiveSection(): void {
    if (!this.sections.length) return;
    const offset = window.innerHeight * 0.4;
    let current = this.activeSection;
    for (const section of this.sections) {
      const rect = section.getBoundingClientRect();
      if (rect.top <= offset && rect.bottom > offset) {
        current = section.id;
        break;
      }
    }
    if (current !== this.activeSection) {
      this.zone.run(() => {
        this.activeSection = current;
        this.cdr.detectChanges();
      });
    }
  }
}