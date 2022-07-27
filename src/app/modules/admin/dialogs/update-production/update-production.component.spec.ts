import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateProductionComponent } from './update-production.component';

describe('UpdateProductionComponent', () => {
  let component: UpdateProductionComponent;
  let fixture: ComponentFixture<UpdateProductionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateProductionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateProductionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
