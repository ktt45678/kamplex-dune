import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateEmailComponent } from './update-email.component';

describe('UpdateEmailComponent', () => {
  let component: UpdateEmailComponent;
  let fixture: ComponentFixture<UpdateEmailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateEmailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
