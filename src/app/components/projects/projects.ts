import {
  Component, OnInit, AfterViewInit, OnDestroy,
  inject, signal, computed, ChangeDetectorRef, NgZone, ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectsService } from '../../services/projects.service';
import { Projects } from '../../models/projects.model';
import { AuthServices } from '../../services/auth.services';
import { DialogService } from '../../services/dialog.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, finalize } from 'rxjs';
import { ProjectsModal } from '../projects-modal/projects-modal';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, ProjectsModal],
  templateUrl: './projects.html',
  styleUrl: './projects.css',
})
export class ProjectsComponent implements OnInit, AfterViewInit, OnDestroy {
  private projService = inject(ProjectsService);
  private auth = inject(AuthServices);
  private dialog = inject(DialogService);
  private cdr = inject(ChangeDetectorRef);
  private zone = inject(NgZone);
  private el = inject(ElementRef);

  isLoggedIn = toSignal(this.auth.currentUser$.pipe(map(user => !!user)), { initialValue: false });

  private projectList = signal<Projects[]>([]);
  projects = computed(() =>
    [...this.projectList()].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
  );

  isSaving = signal(false);
  showModal = signal(false);
  modalMode = signal<'add' | 'edit'>('add');
  selectedProject = signal<Partial<Projects>>({});
  deletingIds = signal<Set<number>>(new Set());

  private observer: IntersectionObserver | null = null;

  ngOnInit() {
    const cached = localStorage.getItem('cached_projects');
    if (cached) {
      try { this.projectList.set(JSON.parse(cached)); } catch (e) { }
    }
    this.loadProjects();
  }

  ngAfterViewInit() {
    this.initObserver();
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }

  private initObserver() {
    this.zone.runOutsideAngular(() => {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              this.observer?.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 }
      );
      this.observeItems();
    });
  }

  private observeItems() {
    const items = this.el.nativeElement.querySelectorAll('.reveal:not(.visible)');
    items.forEach((item: Element) => this.observer?.observe(item));
  }

  loadProjects() {
    this.projService.getProjects().subscribe({
      next: (data) => {
        this.projectList.set(data);
        localStorage.setItem('cached_projects', JSON.stringify(data));
        setTimeout(() => this.observeItems(), 100);
      }
    });
  }

  openAddModal() {
    const nextOrder = this.projectList().length > 0
      ? Math.max(...this.projectList().map(p => p.sort_order ?? 0)) + 1
      : 1;

    this.selectedProject.set({ sort_order: nextOrder, title: '', description: '', github_url: '' });
    this.modalMode.set('add');
    this.showModal.set(true);
  }

  openEditModal(proj: Projects) {
    this.selectedProject.set({ ...proj });
    this.modalMode.set('edit');
    this.showModal.set(true);
  }

  handleDelete(proj: Projects) {
    this.dialog.confirm('Delete Project', `Delete "${proj.title}"?`, () => {
      const id = proj.id;
      this.deletingIds.update(set => new Set([...set, id]));

      setTimeout(() => {
        this.projService.deleteProject(id).subscribe({
          next: () => {
            this.projectList.update(old => old.filter(p => p.id !== id));
            this.deletingIds.update(set => {
              const next = new Set(set);
              next.delete(id);
              return next;
            });
            localStorage.setItem('cached_projects', JSON.stringify(this.projectList()));
          }
        });
      }, 500);
    });
  }

  handleSave(data: Projects) {
    this.isSaving.set(true);
    const isAdd = this.modalMode() === 'add';
    const request = isAdd ? this.projService.createProject(data) : this.projService.updateProject(data.id, data);

    request.pipe(finalize(() => this.isSaving.set(false))).subscribe({
      next: (res) => {
        this.projectList.update(old => isAdd ? [...old, res] : old.map(p => p.id === res.id ? res : p));
        localStorage.setItem('cached_projects', JSON.stringify(this.projectList()));
        this.showModal.set(false);
        if (isAdd) setTimeout(() => this.observeItems(), 100);
      }
    });
  }
}