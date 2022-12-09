import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { CursorPaginated, Playlist } from '../../../../core/models';
import { DestroyService, PlaylistsService } from '../../../../core/services';
import { track_Id } from '../../../../core/utils';

@Component({
  selector: 'app-playlists',
  templateUrl: './playlists.component.html',
  styleUrls: ['./playlists.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PlaylistsService]
})
export class PlaylistsComponent implements OnInit {
  loadingPlaylists: boolean = false;
  playlistLimit: number = 30;
  skeletonArray: Array<any>;
  playlistList?: CursorPaginated<Playlist>;
  track_Id = track_Id;

  constructor(private ref: ChangeDetectorRef, private playlistsService: PlaylistsService, private destroyService: DestroyService) {
    this.skeletonArray = new Array(this.playlistLimit);
  }

  ngOnInit(): void {
    this.loadPlaylists();
  }

  loadPlaylists(pageToken?: string): void {
    this.loadingPlaylists = true;
    const sort = 'desc(_id)';
    this.playlistsService.findPage({
      pageToken: pageToken,
      sort: sort,
      limit: this.playlistLimit
    }).subscribe(newGroupList => {
      this.appendPlaylists(newGroupList);
    }).add(() => {
      this.loadingPlaylists = false;
      this.ref.markForCheck();
    });
  }

  appendPlaylists(newList: CursorPaginated<Playlist>): void {
    if (!this.playlistList) {
      this.playlistList = newList;
      return;
    }
    if (this.playlistList.nextPageToken === newList.nextPageToken && this.playlistList.prevPageToken === newList.prevPageToken)
      return;
    this.playlistList.nextPageToken = newList.nextPageToken;
    this.playlistList.prevPageToken = newList.prevPageToken;
    this.playlistList.results.push(...newList.results);
  }

}
