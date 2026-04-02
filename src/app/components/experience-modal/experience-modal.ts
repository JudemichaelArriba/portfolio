import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Experience } from '../../models/experience.model';

@Component({
  selector: 'app-experience-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './experience-modal.html'
})
export class ExperienceModal {
  @Input() experience: Partial<Experience> = {};
  @Input() isSaving = false;
  @Input() mode: 'add' | 'edit' = 'add';
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Experience>();

  onSubmit() {
    this.save.emit(this.experience as Experience);
  }
}