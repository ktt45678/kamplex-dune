import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseVideoPlayerComponent } from './base-video-player.component';

describe('BaseVideoPlayerComponent', () => {
  let component: BaseVideoPlayerComponent;
  let fixture: ComponentFixture<BaseVideoPlayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BaseVideoPlayerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BaseVideoPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
