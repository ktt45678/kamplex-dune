import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EpisodeListComponent } from './episode-list.component';

describe('EpisodeListComponent', () => {
  let component: EpisodeListComponent;
  let fixture: ComponentFixture<EpisodeListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EpisodeListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EpisodeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
