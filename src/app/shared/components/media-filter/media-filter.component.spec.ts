import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaFilterComponent } from './media-filter.component';

describe('MediaFilterComponent', () => {
  let component: MediaFilterComponent;
  let fixture: ComponentFixture<MediaFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MediaFilterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MediaFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
