import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppsList } from './apps-list';

describe('AppsList', () => {
  let component: AppsList;
  let fixture: ComponentFixture<AppsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppsList],
    }).compileComponents();

    fixture = TestBed.createComponent(AppsList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
