import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateMediaComponent } from './update-media.component';

describe('UpdateMediaComponent', () => {
  let component: UpdateMediaComponent;
  let fixture: ComponentFixture<UpdateMediaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateMediaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateMediaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
