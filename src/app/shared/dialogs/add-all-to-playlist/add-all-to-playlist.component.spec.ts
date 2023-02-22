import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAllToPlaylistComponent } from './add-all-to-playlist.component';

describe('AddAllToPlaylistComponent', () => {
  let component: AddAllToPlaylistComponent;
  let fixture: ComponentFixture<AddAllToPlaylistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddAllToPlaylistComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddAllToPlaylistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
