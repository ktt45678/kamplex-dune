import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RatingCardComponent } from './rating-card.component';

describe('RatingCardComponent', () => {
  let component: RatingCardComponent;
  let fixture: ComponentFixture<RatingCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RatingCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RatingCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
