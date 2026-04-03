import { Component, Input, Output, EventEmitter } from '@angular/core';
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

  submit() {
    this.save.emit(this.project as Projects);
  }
}