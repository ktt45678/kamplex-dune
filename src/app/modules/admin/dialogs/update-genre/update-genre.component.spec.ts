import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateGenreComponent } from './update-genre.component';

describe('UpdateGenreComponent', () => {
  let component: UpdateGenreComponent;
  let fixture: ComponentFixture<UpdateGenreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateGenreComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateGenreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
