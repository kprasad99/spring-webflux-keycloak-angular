import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Sso } from './sso';

describe('Sso', () => {
  let component: Sso;
  let fixture: ComponentFixture<Sso>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sso],
    }).compileComponents();

    fixture = TestBed.createComponent(Sso);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
