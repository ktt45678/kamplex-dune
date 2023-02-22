import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { DialogService } from 'primeng/dynamicdialog';

import { CursorPaginated, Media, RatingDetails } from '../../../../core/models';
import { RatingsService } from '../../../../core/services';
import { track_Id } from '../../../../core/utils';
import { StarRatingComponent } from '../../../../shared/components/star-rating';
import { AddToPlaylistComponent } from '../../../../shared/dialogs/add-to-playlist';

@Component({
  selector: 'app-rated',
  templateUrl: './rated.component.html',
  styleUrls: ['./rated.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [RatingsService]
})
export class RatedComponent implements OnInit, OnDestroy {
  loadingRatings: boolean = false;
  loadingMoreRatings: boolean = false;
  ratingLimit: number = 30;
  skeletonArray: Array<any>;
  ratingList?: CursorPaginated<RatingDetails>;
  listViewMode: 1 | 2 = 1;
  track_Id = track_Id;

  constructor(private ref: ChangeDetectorRef, private renderer: Renderer2, private translocoService: TranslocoService,
    private dialogService: DialogService, private ratingsService: RatingsService) {
    this.skeletonArray = new Array(this.ratingLimit);
  }

  ngOnInit(): void {
    this.loadRatings();
  }

  loadRatings(resetList?: boolean, pageToken?: string): void {
    if (resetList)
      this.loadingRatings = true;
    else
      this.loadingMoreRatings = true;
    this.ratingsService.findPage({
      pageToken: pageToken,
      limit: this.ratingLimit
    }).subscribe(newGroupList => {
      this.appendRatings(newGroupList);
    }).add(() => {
      if (resetList)
        this.loadingRatings = false;
      else
        this.loadingMoreRatings = false;
      this.ref.markForCheck();
    });
  }

  appendRatings(newList: CursorPaginated<RatingDetails>, resetList?: boolean): void {
    if (!this.ratingList || resetList) {
      this.ratingList = newList;
      return;
    }
    this.ratingList = {
      hasNextPage: newList.hasNextPage,
      nextPageToken: newList.nextPageToken,
      prevPageToken: newList.prevPageToken,
      totalResults: newList.totalResults,
      results: [...this.ratingList.results, ...newList.results]
    };
  }

  onScroll(): void {
    if (!this.ratingList || !this.ratingList.hasNextPage) return;
    this.loadRatings(false, this.ratingList.nextPageToken);
  }

  onRatingMenuClick(button: HTMLButtonElement, opened: boolean): void {
    this.renderer[opened ? 'removeClass' : 'addClass'](button, 'tw-invisible');
    this.renderer[opened ? 'addClass' : 'removeClass'](button, 'tw-visible');
  }

  showAddToPlaylistDialog(media: Media): void {
    this.dialogService.open(AddToPlaylistComponent, {
      data: { ...media },
      header: this.translocoService.translate('media.playlists.addToPlaylists'),
      width: '320px',
      modal: true,
      dismissableMask: true,
      styleClass: 'p-dialog-header-sm'
    });
  }

  onRating(event: any, starRating: StarRatingComponent) {

  }

  ngOnDestroy(): void {
    this.dialogService.dialogComponentRefMap.forEach(dialogRef => {
      dialogRef.instance.close();
    });
  }
}
