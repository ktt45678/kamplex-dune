import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSourceComponent } from './add-source.component';

describe('AddSourceComponent', () => {
  let component: AddSourceComponent;
  let fixture: ComponentFixture<AddSourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddSourceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddSourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
