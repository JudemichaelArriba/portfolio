import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Projects } from '../../models/projects.model';

@Component({
  selector: 'app-projects-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './projects-modal.html',
})
export class ProjectsModal {
  @Input() mode: 'add' | 'edit' = 'add';
  @Input() project: Partial<Projects> = {};
  @Input() isSaving = false;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Projects>();
  isClosing = signal(false);

  submit() {
    this.save.emit(this.project as Projects);
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.project.image = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  handleClose() {
    if (this.isSaving) return;
    this.isClosing.set(true);

    setTimeout(() => {
      this.close.emit();
    }, 200);
  }
}