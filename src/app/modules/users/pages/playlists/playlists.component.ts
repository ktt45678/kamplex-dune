import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { DialogService } from 'primeng/dynamicdialog';
import { TranslocoService } from '@ngneat/transloco';
import { first } from 'rxjs';

import { CreatePlaylistComponent } from '../../dialogs/create-playlist';
import { AddAllToPlaylistComponent } from '../../../../shared/dialogs/add-all-to-playlist';
import { CursorPaginated, Playlist, PlaylistDetails } from '../../../../core/models';
import { AuthService, PlaylistsService } from '../../../../core/services';
import { track_Id } from '../../../../core/utils';
import { MediaVisibility } from '../../../../core/enums';

@Component({
  selector: 'app-playlists',
  templateUrl: './playlists.component.html',
  styleUrls: ['./playlists.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PlaylistsService]
})
export class PlaylistsComponent implements OnInit, OnDestroy {
  track_Id = track_Id;
  MediaVisibility = MediaVisibility;
  loadingPlaylists: boolean = false;
  loadingMorePlaylists: boolean = false;
  playlistLimit: number = 30;
  skeletonArray: Array<any>;
  playlistList?: CursorPaginated<Playlist>;
  listViewMode: 1 | 2 = 1;

  constructor(private ref: ChangeDetectorRef, private renderer: Renderer2, private router: Router,
    private dialogService: DialogService, private translocoService: TranslocoService, private authService: AuthService,
    private playlistsService: PlaylistsService) {
    this.skeletonArray = new Array(this.playlistLimit);
  }

  ngOnInit(): void {
    this.loadPlaylists();
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
      limit: this.playlistLimit
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

  onPlaylistMenuClick(button: HTMLButtonElement, opened: boolean): void {
    this.renderer[opened ? 'removeClass' : 'addClass'](button, 'tw-invisible');
    this.renderer[opened ? 'addClass' : 'removeClass'](button, 'tw-visible');
  }

  showAddToPlaylistDialog(playlist: Playlist) {
    if (!this.authService.currentUser) {
      this.router.navigate(['/sign-in'], { queryParams: { continue: this.router.url } });
      return;
    }
    this.dialogService.open(AddAllToPlaylistComponent, {
      data: { ...playlist },
      header: this.translocoService.translate('media.playlists.addAllToPlaylists'),
      width: '320px',
      modal: true,
      dismissableMask: true,
      styleClass: 'p-dialog-header-sm'
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
