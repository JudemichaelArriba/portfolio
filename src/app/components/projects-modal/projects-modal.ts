import { Component, Input, Output, EventEmitter, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Projects } from '../../models/projects.model';

@Component({
  selector: 'app-projects-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './projects-modal.html',
  styleUrl: './projects-modal.css'
})
export class ProjectsModal {
  @Input() mode: 'add' | 'edit' = 'add';
  @Input() project: Partial<Projects> = {};
  @Input() isSaving = false;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Projects>();

  isClosing = signal(false);
  urlPattern = '^(https?:\\/\\/)?((?:[\\da-z.-]+)\\.([a-z.]{2,6})([/\\w .-]*)*\\/?$)';

  constructor(private cdr: ChangeDetectorRef) { } 

  submit() {
    if (this.isSaving) return;
    this.save.emit(this.project as Projects);
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File is too large. Please upload an image under 2MB.");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        this.project.image = reader.result as string;
        this.cdr.detectChanges();  
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