import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthServices } from './auth-services';

describe('AuthServices', () => {
  let component: AuthServices;
  let fixture: ComponentFixture<AuthServices>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthServices]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthServices);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
