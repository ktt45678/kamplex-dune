import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { DialogService } from 'primeng/dynamicdialog';
import { TranslocoService } from '@ngneat/transloco';
import { takeUntil } from 'rxjs';

import { AddToPlaylistComponent } from '../../../../shared/dialogs/add-to-playlist';
import { MediaDetails } from '../../../../core/models';
import { AuthService, MediaService } from '../../../../core/services';
import { DestroyService } from '../../../../core/services';
import { MediaType } from '../../../../core/enums';
import { SITE_NAME, YOUTUBE_EMBED_URL, YOUTUBE_THUMBNAIL_URL } from '../../../../../environments/config';
import { toHexColor, track_Id } from '../../../../core/utils';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DestroyService]
})
export class DetailsComponent implements OnInit, OnDestroy {
  track_Id = track_Id;
  MediaType = MediaType;
  media?: MediaDetails;
  isMobile: boolean = false;
  displayVideo: boolean = false;
  activeVideoIndex: number = 0;
  youtubeUrl = YOUTUBE_EMBED_URL;
  youtubeThumbnailUrl = YOUTUBE_THUMBNAIL_URL;

  constructor(private ref: ChangeDetectorRef, private title: Title, private meta: Meta, private breakpointObserver: BreakpointObserver,
    private dialogService: DialogService, private translocoService: TranslocoService, private authService: AuthService,
    private mediaService: MediaService, private route: ActivatedRoute, private router: Router, private destroyService: DestroyService) { }

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroyService)).subscribe(params => {
      const id = params['id'];
      if (!id) return;
      this.loadMedia(id);
    });
    this.breakpointObserver.observe('(min-width: 640px)').pipe(takeUntil(this.destroyService)).subscribe(state => {
      this.isMobile = !state.matches;
      this.ref.markForCheck();
    });
  }

  loadMedia(id: string) {
    this.mediaService.findOne(id).subscribe(media => {
      this.media = media;
      this.title.setTitle(`${media.title} - ${SITE_NAME}`);
      this.meta.updateTag({ name: 'description', content: media.overview });
      this.meta.updateTag({ property: 'og:site_name', content: SITE_NAME });
      this.meta.updateTag({ property: 'og:title', content: media.title });
      this.meta.updateTag({ property: 'og:description', content: media.overview });
      media.posterColor && this.meta.updateTag({ name: 'theme-color', content: toHexColor(media.posterColor) });
      media.thumbnailBackdropUrl && this.meta.updateTag({ property: 'og:description', content: media.thumbnailBackdropUrl });
      this.ref.markForCheck();
    });
  }

  viewVideo(index: number) {
    this.activeVideoIndex = index;
    this.displayVideo = true;
  }

  showAddToPlaylistDialog() {
    if (!this.media) return;
    if (!this.authService.currentUser) {
      this.router.navigate(['/sign-in'], { queryParams: { continue: `/details/${this.media._id}` } });
      return;
    }
    this.dialogService.open(AddToPlaylistComponent, {
      data: { ...this.media },
      header: this.translocoService.translate('media.playlists.addToPlaylists'),
      width: '320px',
      modal: true,
      dismissableMask: true,
      styleClass: 'p-dialog-header-sm'
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
