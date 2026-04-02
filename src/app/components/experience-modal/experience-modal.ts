import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Experience } from '../../models/experience.model';

@Component({
  selector: 'app-experience-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './experience-modal.html',
  styleUrl: './experience-modal.css'
})
export class ExperienceModal {
  @Input() experience: Partial<Experience> = {};
  @Input() isSaving = false;
  @Input() mode: 'add' | 'edit' = 'add';
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Experience>();
  isClosing = signal(false);


  onSubmit() {
    this.save.emit(this.experience as Experience);
  }

  handleClose() {
    this.isClosing.set(true);

    setTimeout(() => {
      this.close.emit();
    }, 200);
  }
}