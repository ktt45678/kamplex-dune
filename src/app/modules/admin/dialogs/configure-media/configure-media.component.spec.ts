import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigureMediaComponent } from './configure-media.component';

describe('ConfigureMediaComponent', () => {
  let component: ConfigureMediaComponent;
  let fixture: ComponentFixture<ConfigureMediaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfigureMediaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigureMediaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
