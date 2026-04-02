import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AboutService } from '../../services/about.service';
import { About } from '../../models/about.model';
import { AuthServices } from '../../services/auth.services';
import { DialogService } from '../../services/dialog.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, finalize } from 'rxjs';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class AboutComponent implements OnInit {
  private aboutService = inject(AboutService);
  private auth = inject(AuthServices);
  private dialog = inject(DialogService);


  isLoggedIn = toSignal(this.auth.currentUser$.pipe(map(user => !!user)), { initialValue: false });

  aboutData = signal<About>(this.getCachedAbout());
  isSaving = signal<boolean>(false);
  editingField = signal<string | null>(null);

  tempAboutData: About = { ...this.aboutData() };

  get isEditing(): boolean {
    return this.editingField() !== null;
  }

  private readonly FALLBACK_ABOUT: About = {
    quote: "I build things that work well, look great, and last.",
    paragraph_1: "I'm a passionate developer...",
    paragraph_2: "My approach is pragmatic...",
    paragraph_3: "Whether it's a mobile app...",
    location: "Philippines · UTC+8",
    focus: "Full-Stack & Mobile Dev",
    education: "BS Information Technology",
    preferred_editor: "VS Code",
    work_preference: "Remote · On-site · Hybrid",
    status: "Building & Learning Daily"
  };

  ngOnInit(): void {
    this.fetchAbout();
  }

  private getCachedAbout(): About {
    const cached = localStorage.getItem('cached_about');
    return cached ? JSON.parse(cached) : this.FALLBACK_ABOUT;
  }

  fetchAbout(): void {
    this.aboutService.getAboutData().subscribe({
      next: (data) => {
        if (data) {
          this.aboutData.set(data);
          this.tempAboutData = { ...data };
          localStorage.setItem('cached_about', JSON.stringify(data));
        }
      }
    });
  }

  startEdit(field: string) {
    this.tempAboutData = { ...this.aboutData() };
    this.editingField.set(field);
  }

  cancelEdit() {
    if (this.isSaving()) return;
    this.editingField.set(null);
    this.tempAboutData = { ...this.aboutData() };
  }

  saveChanges() {
    const modified = this.tempAboutData;
    const current = this.aboutData();

    if (!modified.quote?.trim() || !modified.paragraph_1?.trim()) {
      this.dialog.error('Validation Error', 'Essential fields cannot be empty.');
      return;
    }

    if (JSON.stringify(modified) === JSON.stringify(current)) {
      this.dialog.alert('No Changes', 'No modifications detected.');
      return;
    }

    this.dialog.confirm(
      'Update About Section',
      'Are you sure you want to save these professional details?',
      () => {
        const id = modified.id || current.id;
        if (id) {
          this.executeSave(id, modified);
        }
      }
    );
  }

  private executeSave(id: number, data: About) {
    this.isSaving.set(true);
    this.aboutService.updateAbout(id, data)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: (updated) => {
          this.aboutData.set(updated);
          this.tempAboutData = { ...updated };
          localStorage.setItem('cached_about', JSON.stringify(updated));
          this.editingField.set(null);
          this.dialog.success('Success', 'Profile information updated.');
        },
        error: () => this.dialog.error('Error', 'Failed to update professional info.')
      });
  }
}