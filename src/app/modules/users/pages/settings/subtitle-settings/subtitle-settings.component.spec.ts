import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubtitleSettingsComponent } from './subtitle-settings.component';

describe('SubtitleSettingsComponent', () => {
  let component: SubtitleSettingsComponent;
  let fixture: ComponentFixture<SubtitleSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubtitleSettingsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubtitleSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
