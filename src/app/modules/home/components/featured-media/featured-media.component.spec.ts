import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeaturedMediaComponent } from './featured-media.component';

describe('FeaturedMediaComponent', () => {
  let component: FeaturedMediaComponent;
  let fixture: ComponentFixture<FeaturedMediaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FeaturedMediaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FeaturedMediaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
