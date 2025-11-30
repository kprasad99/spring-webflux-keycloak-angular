import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Employee } from './employee';

describe('Employee', () => {
  let component: Employee;
  let fixture: ComponentFixture<Employee>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Employee],
    }).compileComponents();

    fixture = TestBed.createComponent(Employee);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
