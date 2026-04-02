import {
  Component, OnInit, AfterViewInit, OnDestroy,
  inject, signal, computed, ChangeDetectorRef, NgZone, ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExperienceService } from '../../services/experience.service';
import { Experience } from '../../models/experience.model';
import { AuthServices } from '../../services/auth.services';
import { DialogService } from '../../services/dialog.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, finalize } from 'rxjs';
import { ExperienceModal } from '../experience-modal/experience-modal';

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [CommonModule, ExperienceModal],
  templateUrl: './experience.html',
  styleUrl: './experience.css',
})
export class ExperienceComponent implements OnInit, AfterViewInit, OnDestroy {
  private expService = inject(ExperienceService);
  private auth = inject(AuthServices);
  private dialog = inject(DialogService);
  private cdr = inject(ChangeDetectorRef);
  private zone = inject(NgZone);
  private el = inject(ElementRef);

  isLoggedIn = toSignal(this.auth.currentUser$.pipe(map(user => !!user)), { initialValue: false });

  private experienceList = signal<Experience[]>([]);

  experiences = computed(() =>
    [...this.experienceList()].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
  );

  isSaving = signal(false);
  showModal = signal(false);
  modalMode = signal<'add' | 'edit'>('add');
  selectedExperience = signal<Partial<Experience>>({});

  private observer: IntersectionObserver | null = null;

  ngOnInit() {
    const cached = localStorage.getItem('cached_experiences');
    if (cached) {
      try {
        this.experienceList.set(JSON.parse(cached));
      } catch (e) {

      }
    }
    this.loadExperiences();
  }

  ngAfterViewInit() {
    this.zone.runOutsideAngular(() => {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('tl-vis');
              this.observer?.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
      );

      this.observeItems();
    });
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }

  private observeItems() {
    const items = this.el.nativeElement.querySelectorAll('.tl-item:not(.tl-vis)');
    items.forEach((item: Element) => this.observer?.observe(item));
  }

  loadExperiences() {
    this.expService.getExperiences().subscribe({
      next: (data) => {
        if (Array.isArray(data)) {
          this.experienceList.set(data);
          this.saveCache(data);
          setTimeout(() => this.observeItems(), 60);
        }
      }
    });
  }

  private saveCache(data: Experience[]) {
    localStorage.setItem('cached_experiences', JSON.stringify(data));
  }

  openAddModal() {
    const nextOrder = this.experienceList().length > 0
      ? Math.max(...this.experienceList().map(e => e.sort_order ?? 0)) + 1
      : 1;

    this.selectedExperience.set({
      sort_order: nextOrder,
      title: '', company: '', description: '', badge_label: '', date_range: ''
    });
    this.modalMode.set('add');
    this.showModal.set(true);
  }

  openEditModal(exp: Experience) {
    this.selectedExperience.set({ ...exp });
    this.modalMode.set('edit');
    this.showModal.set(true);
  }

  handleSave(data: Experience) {
    this.isSaving.set(true);
    const isAdd = this.modalMode() === 'add';

    const request = isAdd
      ? this.expService.createExperience(data)
      : this.expService.updateExperience(data.id!, data);

    request.pipe(finalize(() => this.isSaving.set(false))).subscribe({
      next: (responseItem: Experience) => {
        this.zone.run(() => {
          this.experienceList.update(old => {
            if (isAdd) {
              const newItem = { ...responseItem, id: responseItem.id ?? Date.now() };
              return [...old, newItem];
            } else {
              return old.map(item => item.id === responseItem.id ? responseItem : item);
            }
          });

          this.saveCache(this.experienceList());
          this.showModal.set(false);
          this.cdr.detectChanges();

          if (isAdd) {
            setTimeout(() => this.observeItems(), 60);
          }
        });

        this.dialog.success('Success', 'Experience saved!');
      },
      error: () => {
        this.dialog.error('Error', 'Save failed.');
      }
    });
  }
}