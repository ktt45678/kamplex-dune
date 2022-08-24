import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddExtStreamsComponent } from './add-ext-streams.component';

describe('AddExtStreamsComponent', () => {
  let component: AddExtStreamsComponent;
  let fixture: ComponentFixture<AddExtStreamsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddExtStreamsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddExtStreamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
