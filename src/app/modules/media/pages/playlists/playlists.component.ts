import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs';

import { CursorPagePlaylistItems, PlaylistDetails } from '../../../../core/models';
import { DestroyService, PlaylistsService } from '../../../../core/services';
import { SITE_NAME } from '../../../../../environments/config';
import { track_Id } from '../../../../core/utils';

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

  constructor(@Inject(DOCUMENT) private document: Document, private ref: ChangeDetectorRef, private renderer: Renderer2,
    private title: Title, private meta: Meta, private playlistsService: PlaylistsService, private route: ActivatedRoute,
    private destroyService: DestroyService) {
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
      this.meta.addTags([
        {
          name: 'description',
          content: playlist.description || 'Media playlist'
        },
        {
          property: 'og:site_name',
          content: 'KamPlex'
        },
        {
          property: 'og:title',
          content: playlist.name
        },
        {
          property: 'og:description',
          content: playlist.description || 'Media playlist'
        }
      ]);
    }).add(() => {
      this.loadingPlaylist = false;
      this.ref.markForCheck();
    });
  }

  loadPlaylistItems(id: string, pageToken?: string): void {
    this.loadingPlaylistItems = true;
    const sort = 'desc(addedAt)';
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
    if (this.playlistItems.nextPageToken === newList.nextPageToken && this.playlistItems.prevPageToken === newList.prevPageToken)
      return;
    this.playlistItems.nextPageToken = newList.nextPageToken;
    this.playlistItems.prevPageToken = newList.prevPageToken;
    this.playlistItems.results.push(...newList.results);
  }

  ngOnDestroy(): void {
    //this.renderer.removeClass(this.document.body, 'tw-overflow-hidden');
  }
}
