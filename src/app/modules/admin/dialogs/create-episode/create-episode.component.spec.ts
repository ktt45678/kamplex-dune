import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEpisodeComponent } from './create-episode.component';

describe('CreateEpisodeComponent', () => {
  let component: CreateEpisodeComponent;
  let fixture: ComponentFixture<CreateEpisodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateEpisodeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateEpisodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
