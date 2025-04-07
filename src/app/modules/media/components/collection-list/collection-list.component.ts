import { ChangeDetectionStrategy, ChangeDetectorRef, Component, input, OnInit, signal } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { TranslocoTranslateFn } from '@ngneat/transloco';
import { takeUntil } from 'rxjs';

import { Media, MediaCollection, MediaDetails } from '../../../../core/models';
import { TextResizeOption } from '../../../../shared/directives/text-directive/text-resize/text-resize.directive';
import { DestroyService } from '../../../../core/services';
import { MediaBreakpoints } from '../../../../core/enums';

@Component({
  selector: 'app-collection-list',
  templateUrl: './collection-list.component.html',
  styleUrl: './collection-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DestroyService]
})
export class CollectionListComponent implements OnInit {
  t = input.required<TranslocoTranslateFn>();
  collectionList = input.required<MediaCollection[]>()
  currentMedia = input<Media | MediaDetails | undefined>();

  collectionNameResizes = signal<TextResizeOption[]>([]);
  isMobile = signal<boolean>(false);

  constructor(private ref: ChangeDetectorRef, private breakpointObserver: BreakpointObserver,
    private destroyService: DestroyService) { }

  ngOnInit(): void {
    this.breakpointObserver.observe(MediaBreakpoints.SMALL).pipe(takeUntil(this.destroyService)).subscribe(state => {
      this.isMobile.set(!state.matches);
      this.updateTitleResizeOptions();
      this.ref.markForCheck();
    });
  }

  updateTitleResizeOptions() {
    if (!this.isMobile()) {
      this.collectionNameResizes.set([
        { length: 20, size: '1.5rem', lineHeight: '2rem' },
        { length: 50, size: '1.25rem', lineHeight: '1.75rem' }
      ]);
    } else {
      this.collectionNameResizes.set([
        { length: 20, size: '1.25rem', lineHeight: '1.75rem' },
        { length: 30, size: '1rem', lineHeight: '1.5rem' },
        { length: 40, size: '0.875rem', lineHeight: '1.25rem' }
      ]);
    }
  }
}
