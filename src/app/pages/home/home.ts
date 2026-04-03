import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { HeroComponent } from '../../components/hero/hero';
import { AboutComponent } from '../../components/about/about';
import { ExperienceComponent } from '../../components/experience/experience';
import { Skills } from '../../components/skills/skills';
import { ProjectsComponent } from '../../components/projects/projects';
import { Contact } from '../../components/contact/contact';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeroComponent, AboutComponent, ExperienceComponent, Skills, ProjectsComponent, Contact, Footer],
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

    let W = 0, H = 0;
    const COUNT = 80;
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
      x = 0; y = 0; r = 0; vx = 0; vy = 0; opacity = 0;

      constructor() { this.init(true); }

      init(rnd: boolean) {
        this.x = Math.random() * W;
        this.y = Math.random() * H;
        this.r = Math.random() * 2 + 1;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.2;
      }

      tick() {
        this.x += this.vx;
        this.y += this.vy;


        if (this.x < -10) this.x = W + 10;
        if (this.x > W + 10) this.x = -10;
        if (this.y < -10) this.y = H + 10;
        if (this.y > H + 10) this.y = -10;
      }

      draw() {
        ctx!.globalAlpha = this.opacity;
        ctx!.fillStyle = isDark() ? '#60a5fa' : '#2563eb';
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    for (let i = 0; i < COUNT; i++) particles.push(new P());

    const drawLines = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);

          if (d < 150) {

            ctx!.globalAlpha = (1 - d / 150) * 0.4 * (isDark() ? 1 : 0.6);
            ctx!.strokeStyle = isDark() ? '#3b82f6' : '#2563eb';
            ctx!.lineWidth = 0.8;
            ctx!.beginPath();
            ctx!.moveTo(particles[i].x, particles[i].y);
            ctx!.lineTo(particles[j].x, particles[j].y);
            ctx!.stroke();
          }
        }
      }
    };

    const loop = () => {
      ctx!.clearRect(0, 0, W, H);
      drawLines();
      particles.forEach(p => { p.tick(); p.draw(); });
      ctx!.globalAlpha = 1;
      this.rafId = requestAnimationFrame(loop);
    };
    loop();
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
      let w = 0;
      pills.forEach((p, i) => { if (i < pills.length / 2) w += (p as HTMLElement).offsetWidth + 16; });
      const s = document.createElement('style');
      s.textContent = `@keyframes tickerScroll{0%{transform:translateX(0)}100%{transform:translateX(-${w}px)}}`;
      document.head.appendChild(s);
    };
    window.addEventListener('load', onLoad);
    this.cleanup.push(() => window.removeEventListener('load', onLoad));
  }
}