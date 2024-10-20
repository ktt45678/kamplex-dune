import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectOrderComponent } from './select-order.component';

describe('SelectOrderComponent', () => {
  let component: SelectOrderComponent;
  let fixture: ComponentFixture<SelectOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SelectOrderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SelectOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
