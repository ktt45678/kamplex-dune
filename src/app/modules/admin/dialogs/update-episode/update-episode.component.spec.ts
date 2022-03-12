import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateEpisodeComponent } from './update-episode.component';

describe('UpdateEpisodeComponent', () => {
  let component: UpdateEpisodeComponent;
  let fixture: ComponentFixture<UpdateEpisodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateEpisodeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateEpisodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
