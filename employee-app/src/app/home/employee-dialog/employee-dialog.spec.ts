import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeDialog } from './employee-dialog';

describe('EmployeeDialog', () => {
  let component: EmployeeDialog;
  let fixture: ComponentFixture<EmployeeDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeeDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
