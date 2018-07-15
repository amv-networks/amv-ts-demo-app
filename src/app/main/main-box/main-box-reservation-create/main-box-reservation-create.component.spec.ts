import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MainBoxReservationCreateComponent } from './main-box-reservation-create.component';

describe('MainBoxReservationCreateComponent', () => {
  let component: MainBoxReservationCreateComponent;
  let fixture: ComponentFixture<MainBoxReservationCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MainBoxReservationCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainBoxReservationCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
