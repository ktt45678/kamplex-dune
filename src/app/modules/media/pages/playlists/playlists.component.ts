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

  constructor(private ref: ChangeDetectorRef, private renderer: Renderer2,
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

  addToPlaylist(): void {
    alert('Add to playlist');
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
    //this.renderer.removeClass(this.document.body, 'tw-overflow-hidden');
  }
}
