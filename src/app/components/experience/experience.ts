import { Component, OnInit, inject, signal } from '@angular/core';
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
export class ExperienceComponent implements OnInit {
  private expService = inject(ExperienceService);
  private auth = inject(AuthServices);
  private dialog = inject(DialogService);

  isLoggedIn = toSignal(this.auth.currentUser$.pipe(map(user => !!user)), { initialValue: false });


  experiences = signal<Experience[]>([
    {
      id: 3,
      title: "BS Information System",
      company: "Aces Tagum Collage Inc.",
      badge_label: "1st Year",
      date_range: "2023 - 2024",
      description: "Studied core fundamentals of BSIT including programming logic, data structures, and problem solving...",
      sort_order: 1
    },
    {
      id: 4,
      title: "BS Information System",
      company: "Aces Tagum Collage Inc.",
      badge_label: "2nd Year",
      date_range: "2024 - 2025",
      description: "Deepened knowledge in object-oriented programming, database management...",
      sort_order: 2
    },
    {
      id: 5,
      title: "BS Information System",
      company: "Aces Tagum Collage Inc.",
      badge_label: "3rd Year",
      date_range: "2025 - Present",
      description: "Leading the development of the capstone project as the main developer...",
      sort_order: 3
    }
  ]);

  isSaving = signal(false);
  showModal = signal(false);
  modalMode = signal<'add' | 'edit'>('add');
  selectedExperience = signal<Partial<Experience>>({});

  ngOnInit() {
    this.fetchExperiences();
  }

  fetchExperiences() {
    this.expService.getExperiences().subscribe({
      next: (data) => {
        if (data && data.length > 0) this.experiences.set(data);
      },
      error: () => {
        console.log("Using default local data.")
      }
        
    });
  }

  openAddModal() {

    this.selectedExperience.set({ sort_order: this.experiences().length + 1 });
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
    const request = this.modalMode() === 'add'
      ? this.expService.createExperience(data)
      : this.expService.updateExperience(data.id!, data);

    request.pipe(finalize(() => this.isSaving.set(false))).subscribe({
      next: () => {
        this.fetchExperiences();
        this.showModal.set(false);
        this.dialog.success('Success', 'Experience updated.');
      }
    });
  }
}