import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaTopComponent } from './media-top.component';

describe('MediaTopComponent', () => {
  let component: MediaTopComponent;
  let fixture: ComponentFixture<MediaTopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MediaTopComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MediaTopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
