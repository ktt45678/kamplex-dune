import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaylistSettingsComponent } from './playlist-settings.component';

describe('PlaylistSettingsComponent', () => {
  let component: PlaylistSettingsComponent;
  let fixture: ComponentFixture<PlaylistSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlaylistSettingsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlaylistSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
