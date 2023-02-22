import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddToPlaylistComponent } from './add-to-playlist.component';

describe('AddToPlaylistComponent', () => {
  let component: AddToPlaylistComponent;
  let fixture: ComponentFixture<AddToPlaylistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddToPlaylistComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddToPlaylistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
