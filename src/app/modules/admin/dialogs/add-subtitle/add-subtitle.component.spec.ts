import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSubtitleComponent } from './add-subtitle.component';

describe('AddSubtitleComponent', () => {
  let component: AddSubtitleComponent;
  let fixture: ComponentFixture<AddSubtitleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddSubtitleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddSubtitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
