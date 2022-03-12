import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateVideoComponent } from './update-video.component';

describe('UpdateVideoComponent', () => {
  let component: UpdateVideoComponent;
  let fixture: ComponentFixture<UpdateVideoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateVideoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
