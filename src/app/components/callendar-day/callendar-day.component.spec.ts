import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CallendarDayComponent } from './callendar-day.component';

describe('CallendarDayComponent', () => {
  let component: CallendarDayComponent;
  let fixture: ComponentFixture<CallendarDayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CallendarDayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CallendarDayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
