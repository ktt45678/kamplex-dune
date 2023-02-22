import { Component, OnInit, ChangeDetectionStrategy, Input, Renderer2, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoService, TRANSLOCO_SCOPE } from '@ngneat/transloco';
import { DialogService } from 'primeng/dynamicdialog';

import { CursorPaginated, Media, Paginated } from '../../../core/models';
import { AuthService } from '../../../core/services';
import { MediaType } from '../../../core/enums';
import { AddToPlaylistComponent } from '../../dialogs/add-to-playlist';
import { track_Id } from '../../../core/utils';

@Component({
  selector: 'app-media-list',
  templateUrl: './media-list.component.html',
  styleUrls: ['./media-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    DialogService,
    {
      provide: TRANSLOCO_SCOPE,
      useValue: 'media'
    }
  ]
})
export class MediaListComponent implements OnInit, OnDestroy {
  track_Id = track_Id;
  MediaType = MediaType;
  @Input() loading: boolean = false;
  @Input() loadingMore: boolean = false;
  @Input() mediaList?: Paginated<Media> | CursorPaginated<Media>;
  @Input() itemLimit: number = 30;
  @Input() viewMode: number = 1;
  skeletonArray: Array<any>;

  constructor(private renderer: Renderer2, private dialogService: DialogService, private translocoService: TranslocoService,
    private authService: AuthService, private router: Router) {
    this.skeletonArray = new Array(this.itemLimit);
  }

  ngOnInit(): void {
  }

  onMediaMenuClick(button: HTMLButtonElement, opened: boolean): void {
    this.renderer[opened ? 'removeClass' : 'addClass'](button, 'tw-invisible');
    this.renderer[opened ? 'addClass' : 'removeClass'](button, 'tw-visible');
  }

  showAddToPlaylistDialog(media: Media) {
    if (!this.authService.currentUser) {
      this.router.navigate(['/sign-in']);
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

  ngOnDestroy(): void {
    this.dialogService.dialogComponentRefMap.forEach(dialogRef => {
      dialogRef.instance.close();
    });
  }
}
