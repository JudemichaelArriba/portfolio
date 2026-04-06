import {
  Component, OnInit, AfterViewInit, OnDestroy,
  inject, signal, computed, NgZone, ElementRef
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
  private zone = inject(NgZone);
  private el = inject(ElementRef);

  isLoggedIn = toSignal(this.auth.currentUser$.pipe(map(user => !!user)), { initialValue: false });

  private projectList = signal<Projects[]>([]);
  projects = computed(() =>
    [...this.projectList()].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
  );

  isFetching = signal(true);
  isSaving = signal(false);
  showModal = signal(false);
  modalMode = signal<'add' | 'edit'>('add');
  selectedProject = signal<Partial<Projects>>({});
  deletingIds = signal<Set<number>>(new Set());
  loadedImages = signal<Set<number>>(new Set());

  private observer: IntersectionObserver | null = null;

  ngOnInit() {
    const cached = localStorage.getItem('cached_projects');
    if (cached) {
      try {
        this.projectList.set(JSON.parse(cached));
        this.isFetching.set(false);
      } catch (e) { }
    }
    this.loadProjects();
  }

  ngAfterViewInit() {
    this.initObserver();
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }

  onImageLoad(id: number) {
    this.loadedImages.update(set => new Set([...set, id]));
  }

  loadProjects() {
    this.isFetching.set(true);
    this.projService.getProjects().pipe(
      finalize(() => this.isFetching.set(false))
    ).subscribe({
      next: (data) => {
        this.projectList.set(data);
        this.updateCache(data);
        setTimeout(() => this.observeItems(), 100);
      },
      error: () => this.isFetching.set(false)
    });
  }

  private updateCache(list: Projects[]) {
    try {
      const lightData = list.map(({ image, ...rest }) => rest);
      localStorage.setItem('cached_projects', JSON.stringify(lightData));
    } catch (e) {
      localStorage.removeItem('cached_projects');
    }
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
      this.projService.deleteProject(id).subscribe({
        next: () => {
          this.projectList.update(old => old.filter(p => p.id !== id));
          this.deletingIds.update(set => {
            const next = new Set(set);
            next.delete(id);
            return next;
          });
        },
        error: () => {
          this.deletingIds.update(set => {
            const next = new Set(set);
            next.delete(id);
            return next;
          });
        }
      });
    });
  }

  handleSave(data: Projects) {
    this.dialog.confirm('Confirm Save', 'Are you sure you want to save changes?', () => {
      this.isSaving.set(true);
      const isAdd = this.modalMode() === 'add';
      const request = isAdd ? this.projService.createProject(data) : this.projService.updateProject(data.id, data);
      request.pipe(finalize(() => this.isSaving.set(false))).subscribe({
        next: (res) => {
          this.projectList.update(old => isAdd ? [...old, res] : old.map(p => p.id === res.id ? res : p));
          this.showModal.set(false);
          this.dialog.success('Success', 'Project saved successfully');
          if (isAdd) setTimeout(() => this.observeItems(), 100);
        },
        error: () => this.dialog.error('Error', 'Failed to save project')
      });
    });
  }
}