import { Component, OnInit, ChangeDetectionStrategy, Renderer2, OnDestroy, input } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoService, TranslocoTranslateFn } from '@ngneat/transloco';
import { DialogService } from 'primeng/dynamicdialog';

import { Media } from '../../../../core/models';
import { AuthService } from '../../../../core/services';
import { MediaType } from '../../../../core/enums';
import { AddToPlaylistComponent } from '../../../../shared/dialogs/add-to-playlist';

@Component({
  selector: 'app-collection-media-list',
  templateUrl: './collection-media-list.component.html',
  styleUrl: './collection-media-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CollectionMediaListComponent implements OnInit, OnDestroy {
  MediaType = MediaType;
  t = input.required<TranslocoTranslateFn>();
  mediaList = input<Media[] | undefined>();

  constructor(private renderer: Renderer2, private dialogService: DialogService, private translocoService: TranslocoService,
    private authService: AuthService, private router: Router) { }

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
