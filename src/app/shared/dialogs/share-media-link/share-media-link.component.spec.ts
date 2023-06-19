import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareMediaLinkComponent } from './share-media-link.component';

describe('ShareMediaLinkComponent', () => {
  let component: ShareMediaLinkComponent;
  let fixture: ComponentFixture<ShareMediaLinkComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ShareMediaLinkComponent]
    });
    fixture = TestBed.createComponent(ShareMediaLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
