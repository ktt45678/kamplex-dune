import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, filter, forkJoin, Observable, takeUntil, tap } from 'rxjs';

import { CursorPaginated, History, Playlist, RatingDetails, UserDetails } from '../../../../core/models';
import { AuthService, DestroyService, HistoryService, PlaylistsService, RatingsService } from '../../../../core/services';
import { UsersStateService } from '../../services';
import { MediaType } from '../../../../core/enums';
import { track_Id } from '../../../../core/utils';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [HistoryService, PlaylistsService, RatingsService, DestroyService]
})
export class ProfileComponent implements OnInit {
  track_Id = track_Id;
  MediaType = MediaType;
  loadingUserMedia: boolean = false;
  userMediaLimit: number = 10;
  currentUser: UserDetails | null = null;
  user: UserDetails | null = null;
  historyList?: CursorPaginated<History>;
  playlistList?: CursorPaginated<Playlist>;
  ratingList?: CursorPaginated<RatingDetails>;

  constructor(private ref: ChangeDetectorRef, private route: ActivatedRoute,
    private usersStateService: UsersStateService, private authService: AuthService,
    private historyService: HistoryService, private playlistsService: PlaylistsService, private ratingsService: RatingsService,
    private destroyService: DestroyService) { }

  ngOnInit(): void {
    combineLatest([
      this.usersStateService.user$.pipe(takeUntil(this.destroyService)).pipe(
        filter((user): user is UserDetails => (user !== null && this.user?._id !== user._id)),
        tap(user => {
          this.user = user;
          this.loadUserMediaList();
        })
      ),
      this.authService.currentUser$.pipe(takeUntil(this.destroyService)).pipe(tap(user => {
        this.currentUser = user;
        this.ref.markForCheck();
      }))
    ]).subscribe(() => {
      this.loadUserMediaList();
    });
  }

  loadUserMediaList(): void {
    this.loadingUserMedia = true;
    const loadUserMediaOperations: Observable<any>[] = [
      this.playlistsService.findPage({ limit: this.userMediaLimit, sort: 'desc(updatedAt)', author: this.user!._id })
        .pipe(tap(newList => {
          this.playlistList = newList;
        })),
      this.ratingsService.findPage({ limit: this.userMediaLimit, sort: 'desc(date)', user: this.user!._id })
        .pipe(tap(newList => {
          this.ratingList = newList;
        }))
    ];
    if (this.currentUser && this.user && this.currentUser._id === this.user._id) {
      loadUserMediaOperations.push(this.historyService.findPage({ limit: this.userMediaLimit }).pipe(tap(newList => {
        this.historyList = newList;
      })));
    }
    forkJoin(loadUserMediaOperations).subscribe().add(() => {
      this.loadingUserMedia = false;
      this.ref.markForCheck();
    });
  }

}
