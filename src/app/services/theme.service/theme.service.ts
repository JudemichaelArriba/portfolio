import { Injectable } from '@angular/core';

type Theme = 'dark' | 'light';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly key = 'portfolio-theme';

  initTheme(): Theme {
    const saved = (localStorage.getItem(this.key) as Theme) || 'dark';
    this.apply(saved);
    return saved;
  }

  toggleTheme(): Theme {
    const next = this.current() === 'dark' ? 'light' : 'dark';
    this.apply(next);
    return next;
  }

  private current(): Theme {
    const t = document.documentElement.getAttribute('data-theme');
    return t === 'light' || t === 'dark' ? t : 'dark';
  }

  private apply(theme: Theme): void {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(this.key, theme);
  }
}
