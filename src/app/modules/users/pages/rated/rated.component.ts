import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { takeUntil } from 'rxjs';

import { CursorPaginated, Media, RatingDetails, UserDetails } from '../../../../core/models';
import { AuthService, DestroyService, RatingsService } from '../../../../core/services';
import { StarRatingComponent } from '../../../../shared/components/star-rating';
import { AddToPlaylistComponent } from '../../../../shared/dialogs/add-to-playlist';
import { track_Id, translocoEscape } from '../../../../core/utils';

@Component({
  selector: 'app-rated',
  templateUrl: './rated.component.html',
  styleUrls: ['./rated.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [RatingsService, DestroyService]
})
export class RatedComponent implements OnInit, OnDestroy {
  track_Id = track_Id;
  loadingRatings: boolean = false;
  loadingMoreRatings: boolean = false;
  displaySettings: boolean = false;
  editMode: boolean = false;
  ratingLimit: number = 30;
  skeletonArray: Array<any>;
  currentUser!: UserDetails | null;
  ratingList?: CursorPaginated<RatingDetails>;
  listViewMode: 1 | 2 = 1;
  userId: string | null = null;

  constructor(private ref: ChangeDetectorRef, private renderer: Renderer2, private translocoService: TranslocoService,
    private route: ActivatedRoute, private router: Router, private dialogService: DialogService,
    private confirmationService: ConfirmationService, private authService: AuthService,
    private ratingsService: RatingsService, private destroyService: DestroyService) {
    this.skeletonArray = new Array(this.ratingLimit);
  }

  ngOnInit(): void {
    this.route.parent?.paramMap.pipe(takeUntil(this.destroyService)).subscribe(params => {
      this.userId = params.get('id');
      this.loadRatings();
    });
    this.authService.currentUser$.pipe(takeUntil(this.destroyService)).subscribe(user => {
      this.currentUser = user;
      this.ref.markForCheck();
    });
  }

  loadRatings(resetList?: boolean, pageToken?: string): void {
    if (resetList)
      this.loadingRatings = true;
    else
      this.loadingMoreRatings = true;
    this.ratingsService.findPage({
      pageToken: pageToken,
      limit: this.ratingLimit,
      sort: 'desc(date)',
      user: this.userId
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

  showAddToPlaylistDialog(media: Media): void {
    if (!this.currentUser) {
      this.router.navigate(['/sign-in'], { queryParams: { continue: this.router.url } });
      return;
    }
    this.dialogService.open(AddToPlaylistComponent, {
      data: { ...media },
      header: this.translocoService.translate('media.playlists.addToPlaylists'),
      width: '320px',
      modal: true,
      dismissableMask: true,
      styleClass: 'p-dialog-header-sm'
    });
  }

  onRating(ratingScore: number | null, rating: RatingDetails, starRating: StarRatingComponent) {
    starRating.disabled = true;
    this.ratingsService.create({
      media: rating.media._id,
      score: ratingScore && (ratingScore * 2)
    }).subscribe({
      error: () => {
        starRating.setRating(rating.score / 2);
      }
    }).add(() => {
      starRating.disabled = false;
      starRating.ref.markForCheck();
    });
  }

  showDeleteRatingDialog(rating: RatingDetails): void {
    const safeMediaName = translocoEscape(rating.media.title);
    this.confirmationService.confirm({
      message: this.translocoService.translate('users.rating.deleteConfirmation', { name: safeMediaName }),
      header: this.translocoService.translate('users.rating.deleteConfirmationHeader'),
      icon: 'ms ms-delete',
      defaultFocus: 'reject',
      accept: () => this.deleteRating(rating)
    });
  }

  deleteRating(rating: RatingDetails): void {
    this.ratingsService.remove(rating._id).subscribe(() => {
      if (!this.ratingList) return;
      const ratingIndex = this.ratingList.results.findIndex(r => r._id === rating._id);
      this.ratingList.results.splice(ratingIndex, 1);
      this.ref.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.dialogService.dialogComponentRefMap.forEach(dialogRef => {
      dialogRef.instance.close();
    });
  }
}
