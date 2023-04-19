import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, Renderer2, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { first, takeUntil } from 'rxjs';

import { PlaylistCardComponent } from '../../components/playlist-card';
import { CreatePlaylistComponent } from '../../dialogs/create-playlist';
import { AddAllToPlaylistComponent } from '../../../../shared/dialogs/add-all-to-playlist';
import { CursorPaginated, Playlist, PlaylistDetails, UserDetails } from '../../../../core/models';
import { AuthService, DestroyService, PlaylistsService } from '../../../../core/services';
import { track_Id, translocoEscape } from '../../../../core/utils';
import { MediaVisibility } from '../../../../core/enums';
import { PlaylistSettingsComponent } from '../../../../shared/dialogs/playlist-settings';

@Component({
  selector: 'app-playlists',
  templateUrl: './playlists.component.html',
  styleUrls: ['./playlists.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PlaylistsService, DestroyService]
})
export class PlaylistsComponent implements OnInit, OnDestroy {
  track_Id = track_Id;
  MediaVisibility = MediaVisibility;
  loadingPlaylists: boolean = false;
  loadingMorePlaylists: boolean = false;
  playlistLimit: number = 30;
  skeletonArray: Array<any>;
  currentUser!: UserDetails | null;
  playlistList?: CursorPaginated<Playlist>;
  listViewMode: 1 | 2 = 1;
  userId: string | null = null;

  constructor(private ref: ChangeDetectorRef, private viewContainerRef: ViewContainerRef, private renderer: Renderer2,
    private route: ActivatedRoute, private router: Router, private dialogService: DialogService,
    private confirmationService: ConfirmationService, private translocoService: TranslocoService, private authService: AuthService,
    private playlistsService: PlaylistsService, private destroyService: DestroyService) {
    this.skeletonArray = new Array(this.playlistLimit);
  }

  ngOnInit(): void {
    this.route.parent?.paramMap.pipe(takeUntil(this.destroyService)).subscribe(params => {
      this.userId = params.get('id');
      this.loadPlaylists();
    });
    this.authService.currentUser$.pipe(takeUntil(this.destroyService)).subscribe(user => {
      this.currentUser = user;
      this.ref.markForCheck();
    });
  }

  loadPlaylists(resetList?: boolean, pageToken?: string): void {
    if (resetList)
      this.loadingPlaylists = true;
    else
      this.loadingMorePlaylists = true;
    const sort = 'desc(_id)';
    this.playlistsService.findPage({
      pageToken: pageToken,
      sort: sort,
      limit: this.playlistLimit,
      author: this.userId
    }).subscribe(newList => {
      this.appendPlaylists(newList);
    }).add(() => {
      if (resetList)
        this.loadingPlaylists = false;
      else
        this.loadingMorePlaylists = false;
      this.ref.markForCheck();
    });
  }

  appendPlaylists(newList: CursorPaginated<Playlist>, resetList?: boolean): void {
    if (!this.playlistList || resetList) {
      this.playlistList = newList;
      return;
    }
    this.playlistList = {
      hasNextPage: newList.hasNextPage,
      nextPageToken: newList.nextPageToken,
      prevPageToken: newList.prevPageToken,
      totalResults: newList.totalResults,
      results: [...this.playlistList.results, ...newList.results]
    };
  }

  onScroll(): void {
    if (!this.playlistList || !this.playlistList.hasNextPage) return;
    this.loadPlaylists(false, this.playlistList.nextPageToken);
  }

  showCreatePlaylistDialog() {
    const dialogRef = this.dialogService.open(CreatePlaylistComponent, {
      width: '500px',
      modal: true,
      styleClass: 'p-dialog-header-sm',
      contentStyle: { 'margin-top': '-1.5rem' },
      dismissableMask: true
    });
    dialogRef.onClose.pipe(first()).subscribe((result: PlaylistDetails) => {
      if (!result || !this.playlistList) return;
      this.playlistList.results.unshift({
        _id: result._id,
        name: result.name,
        itemCount: result.itemCount,
        visibility: result.visibility,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt
      });
      this.ref.markForCheck();
    });
  }

  showAddAllToPlaylistDialog(playlist: Playlist) {
    if (!this.currentUser) {
      this.router.navigate(['/sign-in'], { queryParams: { continue: this.router.url } });
      return;
    }
    this.dialogService.open(AddAllToPlaylistComponent, {
      data: { ...playlist },
      header: this.translocoService.translate('media.playlists.addAllToPlaylists'),
      width: '320px',
      modal: true,
      dismissableMask: true,
      styleClass: 'p-dialog-header-sm',
      viewContainerRef: this.viewContainerRef
    });
  }

  showPlaylistSettingsDialog(playlist: Playlist, playlistCard?: PlaylistCardComponent) {
    const dialogRef = this.dialogService.open(PlaylistSettingsComponent, {
      data: { ...playlist },
      header: this.translocoService.translate('media.playlists.settings'),
      width: '720px',
      modal: true,
      dismissableMask: true,
      styleClass: 'p-dialog-header-sm',
      minimal: true,
      viewContainerRef: this.viewContainerRef
    });
    dialogRef.onClose.pipe(first()).subscribe((updatedPlaylist?: PlaylistDetails) => {
      if (!updatedPlaylist) return;
      Object.assign(playlist, {
        _id: updatedPlaylist._id,
        name: updatedPlaylist.name,
        thumbnailUrl: updatedPlaylist.thumbnailUrl,
        thumbnailThumbnailUrl: updatedPlaylist.thumbnailThumbnailUrl,
        smallThumbnailUrl: updatedPlaylist.smallThumbnailUrl,
        fullThumbnailUrl: updatedPlaylist.fullThumbnailUrl,
        thumbnailColor: updatedPlaylist.thumbnailColor,
        thumbnailMedia: updatedPlaylist.thumbnailMedia && { ...updatedPlaylist.thumbnailMedia },
        itemCount: updatedPlaylist.itemCount,
        visibility: updatedPlaylist.visibility,
        createdAt: updatedPlaylist.createdAt,
        updatedAt: updatedPlaylist.updatedAt
      });
      this.ref.markForCheck();
      playlistCard?.ref.markForCheck();
    });
  }

  showDeletePlaylistDialog(playlist: Playlist): void {
    const safePlaylistName = translocoEscape(playlist.name);
    this.confirmationService.confirm({
      message: this.translocoService.translate('users.playlist.deleteConfirmation', { name: safePlaylistName }),
      header: this.translocoService.translate('users.playlist.deleteConfirmationHeader'),
      icon: 'ms ms-delete',
      defaultFocus: 'reject',
      accept: () => this.deletePlaylist(playlist)
    });
  }

  deletePlaylist(playlist: Playlist) {
    this.playlistsService.remove(playlist._id).subscribe(() => {
      if (!this.playlistList) return;
      const playlistIndex = this.playlistList.results.findIndex(p => p._id === playlist._id);
      this.playlistList.results.splice(playlistIndex, 1);
      this.ref.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.dialogService.dialogComponentRefMap.forEach(dialogRef => {
      dialogRef.instance.close();
    });
  }
}
