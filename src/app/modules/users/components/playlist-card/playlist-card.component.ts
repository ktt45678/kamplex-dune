import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, Renderer2, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs';

import { Playlist, UserDetails } from '../../../../core/models';
import { AuthService, DestroyService } from '../../../../core/services';

@Component({
  selector: 'app-playlist-card [playlist]',
  templateUrl: './playlist-card.component.html',
  styleUrls: ['./playlist-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaylistCardComponent implements OnInit, OnChanges {
  @Input() playlist!: Playlist;
  @Output() onAddAllToPlaylist = new EventEmitter<Playlist>();
  @Output() onPlaylistSettings = new EventEmitter<Playlist>();
  @Output() onDelete = new EventEmitter<Playlist>();
  thumbnailUrl: string | null = null;
  thumbnailBgColor: number = 0;
  thumbnailPlaceholder: string = '';
  userId: string | null = null;
  currentUser!: UserDetails | null;

  constructor(public ref: ChangeDetectorRef, private renderer: Renderer2, private route: ActivatedRoute,
    private authService: AuthService, private destroyService: DestroyService) { }

  ngOnInit(): void {
    this.route.parent?.paramMap.pipe(takeUntil(this.destroyService)).subscribe(params => {
      this.userId = params.get('id');
      this.ref.markForCheck();
    });
    this.authService.currentUser$.pipe(takeUntil(this.destroyService)).subscribe(user => {
      this.currentUser = user;
      this.ref.markForCheck();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['playlist']) {
      const playlist = <Playlist>changes['playlist'].currentValue;
      this.thumbnailUrl = playlist.thumbnailThumbnailUrl || playlist.thumbnailMedia?.smallBackdropUrl || null;
      this.thumbnailBgColor = playlist.thumbnailColor || playlist.thumbnailMedia?.backdropColor || 0;
      this.thumbnailPlaceholder = playlist.thumbnailPlaceholder || playlist.thumbnailMedia?.backdropPlaceholder || '';
      this.ref.markForCheck();
    }
  }

  onPlaylistMenuClick(button: HTMLButtonElement, opened: boolean): void {
    this.renderer[opened ? 'removeClass' : 'addClass'](button, 'tw-invisible');
    this.renderer[opened ? 'addClass' : 'removeClass'](button, 'tw-visible');
  }
}
