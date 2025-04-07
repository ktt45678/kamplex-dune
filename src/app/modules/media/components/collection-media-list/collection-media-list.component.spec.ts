import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionMediaListComponent } from './collection-media-list.component';

describe('CollectionMediaListComponent', () => {
  let component: CollectionMediaListComponent;
  let fixture: ComponentFixture<CollectionMediaListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CollectionMediaListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CollectionMediaListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
