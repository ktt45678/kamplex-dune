import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateBirthdateComponent } from './update-birthdate.component';

describe('UpdateBirthdateComponent', () => {
  let component: UpdateBirthdateComponent;
  let fixture: ComponentFixture<UpdateBirthdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateBirthdateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateBirthdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
