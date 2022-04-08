import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerticalTabComponent } from './vertical-tab.component';

describe('VerticalTabComponent', () => {
  let component: VerticalTabComponent;
  let fixture: ComponentFixture<VerticalTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerticalTabComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VerticalTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
