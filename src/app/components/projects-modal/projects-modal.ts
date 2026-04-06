import { Component, Input, Output, EventEmitter, signal, ChangeDetectorRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Projects } from '../../models/projects.model';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'app-projects-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './projects-modal.html',
  styleUrl: './projects-modal.css'
})
export class ProjectsModal implements OnInit {
  @Input() mode: 'add' | 'edit' = 'add';
  @Input() project: Partial<Projects> = {};
  @Input() isSaving = false;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Projects>();

  private dialog = inject(DialogService);
  private cdr = inject(ChangeDetectorRef);

  isClosing = signal(false);
  urlPattern = '^(https?:\\/\\/)?((?:[\\da-z.-]+)\\.([a-z.]{2,6})([/\\w .-]*)*\\/?$)';

  private initialState: string = '';

  ngOnInit() {
    this.initialState = JSON.stringify(this.project);
  }

  submit() {
    if (this.isSaving) return;

    if (this.mode === 'edit' && JSON.stringify(this.project) === this.initialState) {
      this.dialog.alert('No Changes', 'No changes were detected to update.');
      return;
    }

    this.save.emit(this.project as Projects);
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        this.dialog.error('File Too Large', 'Please upload an image under 2MB.');
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

    if (JSON.stringify(this.project) !== this.initialState) {
      this.dialog.confirm('Unsaved Changes', 'You have unsaved changes. Close anyway?', () => {
        this.executeClose();
      });
    } else {
      this.executeClose();
    }
  }

  private executeClose() {
    this.isClosing.set(true);
    setTimeout(() => this.close.emit(), 200);
  }
}