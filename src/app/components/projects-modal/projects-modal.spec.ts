import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectsModal } from './projects-modal';

describe('ProjectsModal', () => {
  let component: ProjectsModal;
  let fixture: ComponentFixture<ProjectsModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectsModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectsModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
