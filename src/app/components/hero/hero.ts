import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeroService } from '../../services/hero.service';
import { Hero } from '../../models/hero.model';
import { AuthServices } from '../../services/auth.services';
import { DialogService } from '../../services/dialog.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, finalize } from 'rxjs';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class HeroComponent implements OnInit {
  private heroService = inject(HeroService);
  private auth = inject(AuthServices);
  private dialog = inject(DialogService);

  isLoggedIn = toSignal(this.auth.currentUser$.pipe(map(user => !!user)), { initialValue: false });

  private readonly FALLBACK_DATA: Hero = {
    id: undefined,
    name: 'Jude Michael T. Arriba',
    tagline: 'Full-Stack Developer · Mobile & Web',
    bio: 'I design and build clean, scalable applications...',
    profile_pic: "default-profile.jpeg",
  };

  heroData = signal<Hero>(this.getCachedHero());
  isSaving = signal<boolean>(false);
  editingField = signal<string | null>(null);

  get isEditing(): boolean {
    return this.editingField() !== null;
  }

  tempHeroData: Hero = { ...this.heroData() };

  ngOnInit(): void {
    this.loadHero();
  }

  private getCachedHero(): Hero {
    const cached = localStorage.getItem('cached_hero');
    return cached ? JSON.parse(cached) : this.FALLBACK_DATA;
  }

  loadHero(): void {
    this.heroService.getHeroData().subscribe({
      next: (data) => {
        if (data && data.name) {
          if (JSON.stringify(data) !== JSON.stringify(this.heroData())) {
            this.heroData.set(data);
            this.tempHeroData = { ...data };
            localStorage.setItem('cached_hero', JSON.stringify(data));
          }
        }
      }
    });
  }

  startEdit(field: string) {
    this.tempHeroData = { ...this.heroData() };
    this.editingField.set(field);
  }

  cancelEdit() {
    if (this.isSaving()) return;
    this.editingField.set(null);
    this.tempHeroData = { ...this.heroData() };
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        this.dialog.error('File too large', 'Please select an image under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        this.tempHeroData.profile_pic = reader.result as string;
        this.editingField.set('image');
      };
      reader.readAsDataURL(file);
    }
  }

  saveChanges() {
    const modified = this.tempHeroData;
    const current = this.heroData();

    if (!modified.name?.trim() || !modified.tagline?.trim() || !modified.bio?.trim()) {
      this.dialog.error('Validation Error', 'Fields cannot be empty.');
      return;
    }

    if (JSON.stringify(modified) === JSON.stringify(current)) {
      this.dialog.alert('No Changes', 'You haven\'t made any changes to save.');
      return;
    }

    this.dialog.confirm(
      'Confirm Changes',
      'Do you really want to save these changes?',
      () => {
        if (modified.id) {
          this.executeSave(modified);
        } else {
       
          this.executeSave({ ...modified, id: this.heroData().id });
        }
      }
    );
  }

  private executeSave(data: Hero) {
    this.isSaving.set(true);

    this.heroService.updateHero(data.id!, data)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: (res: any) => {
          const updated = res.data || res;
          this.heroData.set(updated);
          localStorage.setItem('cached_hero', JSON.stringify(updated));

          this.editingField.set(null);
          this.dialog.success('Success', 'Hero section updated!');
        },
        error: () => this.dialog.error('Error', 'Failed to update hero.')
      });
  }
}