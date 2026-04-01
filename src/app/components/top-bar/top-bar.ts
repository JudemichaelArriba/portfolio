import { Component, OnInit, AfterViewInit, OnDestroy, NgZone, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { ThemeService } from '../../services/theme.service/theme.service';
import { RouterLink } from '@angular/router';
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

  toggleTheme(): void {
    this.themeMode = this.theme.toggleTheme();
  }

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
    if (this.observer) {
      this.observer.disconnect();
    }
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

    // Fallback scroll spy (covers cases where IntersectionObserver doesn't fire)
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
