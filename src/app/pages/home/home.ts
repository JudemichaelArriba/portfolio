import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { HeroComponent } from '../../components/hero/hero';
import { About } from '../../components/about/about';
import { Experience } from '../../components/experience/experience';
import { Skills } from '../../components/skills/skills';
import { Projects } from '../../components/projects/projects';
import { Contact } from '../../components/contact/contact';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeroComponent, About, Experience, Skills, Projects, Contact, Footer],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements AfterViewInit, OnDestroy {
  private cleanup: Array<() => void> = [];
  private rafId = 0;

  ngAfterViewInit(): void {
    this.initParticles();
    this.initReveal();
    this.initTimeline();
    this.initTicker();
  }

  ngOnDestroy(): void {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.cleanup.forEach(fn => fn());
  }

  private initParticles(): void {
    const canvas = document.getElementById('bg-canvas') as HTMLCanvasElement | null;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const context: CanvasRenderingContext2D = ctx;

    let W = 0;
    let H = 0;
    const mouse = { x: -9999, y: -9999 };
    const COUNT = 68;
    const particles: P[] = [];
    const isDark = () => document.documentElement.getAttribute('data-theme') === 'dark';

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    this.cleanup.push(() => window.removeEventListener('resize', resize));

    class P {
      x = 0; y = 0; r = 0; vx = 0; vy = 0; a = 0; lf = 0; ml = 0;
      constructor() { this.init(true); }
      init(rnd: boolean) {
        this.x = Math.random() * W;
        this.y = rnd ? Math.random() * H : H + 8;
        this.r = Math.random() * 1.6 + 0.3;
        this.vx = (Math.random() - 0.5) * 0.22;
        this.vy = -(Math.random() * 0.3 + 0.07);
        this.a = Math.random() * 0.55 + 0.1;
        this.lf = 0;
        this.ml = Math.random() * 300 + 120;
      }
      tick() {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 100) {
          const f = (100 - d) / 100 * 0.36;
          this.vx += (dx / d) * f;
          this.vy += (dy / d) * f;
        }
        this.vx *= 0.98;
        this.vy *= 0.98;
        this.x += this.vx;
        this.y += this.vy;
        this.lf++;
        if (this.lf > this.ml || this.y < -12) this.init(false);
      }
      draw() {
        const t = this.lf / this.ml;
        const f = t < 0.1 ? t / 0.1 : t > 0.82 ? 1 - (t - 0.82) / 0.18 : 1;
        context.globalAlpha = this.a * f * (isDark() ? 0.9 : 0.28);
        context.fillStyle = isDark() ? '#60a5fa' : '#2563eb';
        context.beginPath();
        context.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        context.fill();
      }
    }

    for (let i = 0; i < COUNT; i++) particles.push(new P());

    const lines = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 115) {
            context.globalAlpha = (1 - d / 115) * 0.1 * (isDark() ? 1 : 0.35);
            context.strokeStyle = isDark() ? '#3b82f6' : '#2563eb';
            context.lineWidth = 0.6;
            context.beginPath();
            context.moveTo(particles[i].x, particles[i].y);
            context.lineTo(particles[j].x, particles[j].y);
            context.stroke();
          }
        }
      }
    };

    const loop = () => {
      context.clearRect(0, 0, W, H);
      lines();
      particles.forEach(p => { p.tick(); p.draw(); });
      context.globalAlpha = 1;
      this.rafId = requestAnimationFrame(loop);
    };
    loop();

    const onMouse = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    document.addEventListener('mousemove', onMouse);
    this.cleanup.push(() => document.removeEventListener('mousemove', onMouse));
  }

  private initReveal(): void {
    const ro = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => ro.observe(el));
    this.cleanup.push(() => ro.disconnect());
  }

  private initTimeline(): void {
    const to = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const d = parseInt((e.target as HTMLElement).dataset['tlDelay'] || '0', 10);
          setTimeout(() => e.target.classList.add('tl-vis'), d);
        }
      });
    }, { threshold: 0.15 });
    document.querySelectorAll('.tl-item').forEach(el => to.observe(el));
    this.cleanup.push(() => to.disconnect());
  }

  private initTicker(): void {
    const track = document.getElementById('tickerTrack') as HTMLElement | null;
    if (!track) return;

    const onLoad = () => {
      const pills = track.querySelectorAll('.lang-pill');
      const half = pills.length / 2;
      let w = 0;
      pills.forEach((p, i) => {
        if (i < half) w += (p as HTMLElement).offsetWidth + 16;
      });
      const s = document.createElement('style');
      s.textContent = `@keyframes tickerScroll{0%{transform:translateX(0)}100%{transform:translateX(-${w}px)}}`;
      document.head.appendChild(s);
    };

    window.addEventListener('load', onLoad);
    this.cleanup.push(() => window.removeEventListener('load', onLoad));
  }
}
