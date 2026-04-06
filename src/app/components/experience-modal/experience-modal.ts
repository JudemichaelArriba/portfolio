import { Component, Input, Output, EventEmitter, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Experience } from '../../models/experience.model';
import { DialogService } from '../../services/dialog.service';
import { inject } from '@angular/core';

@Component({
  selector: 'app-experience-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './experience-modal.html',
  styleUrl: './experience-modal.css'
})
export class ExperienceModal implements OnInit {
  @Input() experience: Partial<Experience> = {};
  @Input() isSaving = false;
  @Input() mode: 'add' | 'edit' = 'add';
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Experience>();

  private dialog = inject(DialogService);

  isClosing = signal(false);
  // Store a snapshot of the data when the modal opens
  private initialData: string = '';

  ngOnInit() {
    // Clone the input to track original state
    this.initialData = JSON.stringify(this.experience);
  }

  onSubmit() {
    if (!this.isFormValid()) return;

    // Check if anything actually changed
    const currentData = JSON.stringify(this.experience);

    if (this.mode === 'edit' && currentData === this.initialData) {
      this.dialog.alert('No Changes', 'You haven\'t made any changes to save.');
      return;
    }

    this.save.emit(this.experience as Experience);
  }

  isFormValid(): boolean {
    return !!(this.experience.title?.trim() &&
      this.experience.company?.trim() &&
      this.experience.description?.trim());
  }

  handleClose() {
    if (this.isSaving) return;

    const currentData = JSON.stringify(this.experience);
    // If user edited but tries to close, warn them (Optional Production Touch)
    if (currentData !== this.initialData && !this.isClosing()) {
      this.dialog.confirm(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to close?',
        () => this.executeClose()
      );
    } else {
      this.executeClose();
    }
  }

  private executeClose() {
    this.isClosing.set(true);
    setTimeout(() => {
      this.close.emit();
    }, 200);
  }
}