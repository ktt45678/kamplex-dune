import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { DialogService } from 'primeng/dynamicdialog';
import { takeUntil } from 'rxjs';

import { CursorPagePlaylistItems, Media, PlaylistDetails } from '../../../../core/models';
import { AuthService, DestroyService, PlaylistsService } from '../../../../core/services';
import { SITE_NAME } from '../../../../../environments/config';
import { track_Id } from '../../../../core/utils';
import { AddToPlaylistComponent } from '../../../../shared/dialogs/add-to-playlist';

@Component({
  selector: 'app-playlists',
  templateUrl: './playlists.component.html',
  styleUrls: ['./playlists.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PlaylistsService, DestroyService]
})
export class PlaylistsComponent implements OnInit, OnDestroy {
  loadingPlaylist: boolean = false;
  loadingPlaylistItems: boolean = false;
  playlist?: PlaylistDetails;
  playlistItems?: CursorPagePlaylistItems;
  playlistItemLimit: number = 30;
  skeletonArray: Array<any>;
  track_Id = track_Id;

  constructor(private ref: ChangeDetectorRef, private renderer: Renderer2,
    private title: Title, private meta: Meta, private dialogService: DialogService, private translocoService: TranslocoService,
    private authService: AuthService, private playlistsService: PlaylistsService,
    private route: ActivatedRoute, private router: Router, private destroyService: DestroyService) {
    this.skeletonArray = new Array(this.playlistItemLimit);
  }

  ngOnInit(): void {
    //this.renderer.addClass(this.document.body, 'tw-overflow-hidden');
    this.route.params.pipe(takeUntil(this.destroyService)).subscribe(params => {
      const id = params['id'];
      if (!id) return;
      this.loadPlaylist(id);
      this.loadPlaylistItems(id);
    });
  }

  loadPlaylist(id: string): void {
    this.loadingPlaylist = true;
    this.playlistsService.findOne(id).subscribe(playlist => {
      this.playlist = playlist;
      this.title.setTitle(`${playlist.name} - ${SITE_NAME}`);
      this.meta.updateTag({ name: 'description', content: playlist.description || 'Media playlist' });
      this.meta.updateTag({ property: 'og:site_name', content: SITE_NAME });
      this.meta.updateTag({ property: 'og:title', content: playlist.name });
      this.meta.updateTag({ property: 'og:description', content: playlist.description || 'Media playlist' });
    }).add(() => {
      this.loadingPlaylist = false;
      this.ref.markForCheck();
    });
  }

  loadPlaylistItems(id: string, pageToken?: string): void {
    this.loadingPlaylistItems = true;
    const sort = 'desc(_id)';
    this.playlistsService.findPageItems(id, {
      pageToken: pageToken,
      sort: sort,
      limit: this.playlistItemLimit
    }).subscribe(newGroupList => {
      this.appendPlaylistItems(newGroupList);
    }).add(() => {
      this.loadingPlaylistItems = false;
      this.ref.markForCheck();
    });
  }

  appendPlaylistItems(newList: CursorPagePlaylistItems): void {
    if (!this.playlistItems) {
      this.playlistItems = newList;
      return;
    }
    this.playlistItems = {
      hasNextPage: newList.hasNextPage,
      nextPageToken: newList.nextPageToken,
      prevPageToken: newList.prevPageToken,
      totalResults: newList.totalResults,
      results: [...this.playlistItems.results, ...newList.results],
      mediaList: [...this.playlistItems.mediaList, ...newList.mediaList]
    };
    this.playlistItems.nextPageToken = newList.nextPageToken;
    this.playlistItems.prevPageToken = newList.prevPageToken;
    this.playlistItems.results.push(...newList.results);
  }

  onPlaylistMenuClick(button: HTMLButtonElement, opened: boolean): void {
    this.renderer[opened ? 'removeClass' : 'addClass'](button, 'tw-invisible');
    this.renderer[opened ? 'addClass' : 'removeClass'](button, 'tw-visible');
  }

  showAddToPlaylistDialog(media: Media) {
    if (!this.authService.currentUser) {
      this.router.navigate(['/sign-in'], { queryParams: { continue: `/playlists/${this.playlist!._id}` } });
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

  removeFromPlaylist(index: number): void {
    if (!this.playlist) return;
    const playlistItem = this.playlistItems?.results[index];
    if (!playlistItem) return;
    const itemId = typeof playlistItem === 'string' ? <string>playlistItem : playlistItem._id;
    this.playlistsService.removePlaylistItem(this.playlist._id, { itemId }).subscribe(() => {
      this.playlistItems!.results.splice(index, 1);
    }).add(() => {
      this.ref.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.title.setTitle(SITE_NAME);
    this.meta.removeTag('name="description"');
    this.meta.removeTag('property="og:site_name"');
    this.meta.removeTag('property="og:title"');
    this.meta.removeTag('property="og:description"');
    this.dialogService.dialogComponentRefMap.forEach(dialogRef => {
      dialogRef.instance.close();
    });
  }
}
