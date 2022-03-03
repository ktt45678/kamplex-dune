import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateProducerComponent } from './create-producer.component';

describe('CreateProducerComponent', () => {
  let component: CreateProducerComponent;
  let fixture: ComponentFixture<CreateProducerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateProducerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateProducerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
