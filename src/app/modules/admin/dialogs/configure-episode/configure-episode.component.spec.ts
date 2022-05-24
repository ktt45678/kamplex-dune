import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigureEpisodeComponent } from './configure-episode.component';

describe('ConfigureEpisodeComponent', () => {
  let component: ConfigureEpisodeComponent;
  let fixture: ComponentFixture<ConfigureEpisodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfigureEpisodeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigureEpisodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
