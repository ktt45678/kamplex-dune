import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateProducerComponent } from './update-producer.component';

describe('UpdateProducerComponent', () => {
  let component: UpdateProducerComponent;
  let fixture: ComponentFixture<UpdateProducerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateProducerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateProducerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
