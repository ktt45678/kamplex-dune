import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateProductionComponent } from './create-production.component';

describe('CreateProductionComponent', () => {
  let component: CreateProductionComponent;
  let fixture: ComponentFixture<CreateProductionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateProductionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateProductionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
