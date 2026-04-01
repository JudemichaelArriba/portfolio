import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeroService } from '../../services/hero.service';
import { Hero } from '../../models/hero.model';
import { AuthServices } from '../../services/auth.services';
import { DialogService } from '../../services/dialog.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

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


  heroData = signal<Hero>({
    id: undefined,
    name: 'Jude Michael T. Arriba',
    tagline: 'Full-Stack Developer · Mobile & Web',
    bio: 'I design and build clean, scalable applications...',
    profile_pic: "default-profile.jpeg",
  });

  editingField = signal<string | null>(null);
  isEditing = false;


  tempHeroData: Hero = { ...this.heroData() };

  ngOnInit(): void {
    this.loadHero();
  }

  loadHero(): void {
    this.heroService.getHeroData().subscribe({
      next: (data) => {

        if (data && data.name) {
          this.heroData.set(data);
          this.tempHeroData = { ...data };
        }
      },
      error: () => {
        // console.warn('Database offline. Using default hero data.')
      }
    });
  }

  startEdit(field: string) {

    this.tempHeroData = { ...this.heroData() };
    this.editingField.set(field);
    this.isEditing = true;
  }

  cancelEdit() {
    this.editingField.set(null);
    this.isEditing = false;
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
        this.isEditing = true;
      };
      reader.readAsDataURL(file);
    }
  }

  saveChanges() {
    const modified = this.tempHeroData;

    if (!modified.name?.trim() || !modified.tagline?.trim() || !modified.bio?.trim()) {
      this.dialog.error('Validation Error', 'Fields cannot be empty.');
      return;
    }


    if (modified.id) {
      this.heroService.updateHero(modified.id, modified).subscribe({
        next: (res: any) => {

          const updated = res.data || res;
          this.heroData.set(updated);
          this.cancelEdit();
          this.dialog.success('Success', 'Hero section updated!');
        },
        error: () => this.dialog.error('Error', 'Failed to update hero.')
      });
    }
  }
}