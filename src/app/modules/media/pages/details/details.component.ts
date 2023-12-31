import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
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
import { MediaBreakpoints, MediaStatus, MediaType } from '../../../../core/enums';
import { TextResizeOption } from '../../../../shared/directives/text-directive/text-resize/text-resize.directive';
import { SITE_NAME, SITE_THEME_COLOR, YOUTUBE_EMBED_URL, YOUTUBE_THUMBNAIL_URL } from '../../../../../environments/config';
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
  MediaStatus = MediaStatus;
  media?: MediaDetails;
  isMobile: boolean = false;
  displayVideo: boolean = false;
  activeVideoIndex: number = 0;
  titleResizes: TextResizeOption[] = [];
  originalTitleResizes: TextResizeOption[] = [];
  youtubeUrl = YOUTUBE_EMBED_URL;
  youtubeThumbnailUrl = YOUTUBE_THUMBNAIL_URL;

  constructor(private ref: ChangeDetectorRef, private title: Title, private meta: Meta, private breakpointObserver: BreakpointObserver,
    private location: Location, private dialogService: DialogService, private translocoService: TranslocoService,
    private authService: AuthService, private mediaService: MediaService, private route: ActivatedRoute, private router: Router,
    private destroyService: DestroyService) { }

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroyService)).subscribe(params => {
      const id = params['id'];
      if (!id) return;
      this.loadMedia(id);
    });
    this.breakpointObserver.observe(MediaBreakpoints.SMALL).pipe(takeUntil(this.destroyService)).subscribe(state => {
      this.isMobile = !state.matches;
      this.updateTitleResizeOptions();
      this.ref.markForCheck();
    });
  }

  loadMedia(id: string) {
    const mediaId = id.split('-')[0];
    this.mediaService.findOne(mediaId).subscribe(media => {
      this.media = media;
      this.title.setTitle(`${media.title} - ${SITE_NAME}`);
      this.meta.updateTag({ name: 'description', content: media.overview });
      this.meta.updateTag({ property: 'og:site_name', content: SITE_NAME });
      this.meta.updateTag({ property: 'og:title', content: media.title });
      this.meta.updateTag({ property: 'og:description', content: media.overview });
      media.posterColor && this.meta.updateTag({ name: 'theme-color', content: toHexColor(media.posterColor) });
      if (media.posterUrl) {
        this.meta.updateTag({ property: 'og:image', content: media.posterUrl });
        this.meta.updateTag({ property: 'og:image:url', content: media.posterUrl });
        this.meta.updateTag({ property: 'og:image:secure_url', content: media.posterUrl });
        this.meta.updateTag({ property: 'og:image:width', content: '500' });
        this.meta.updateTag({ property: 'og:image:height', content: '750' });
        this.meta.updateTag({ property: 'og:image:type', content: 'image/jpeg' });
        this.meta.updateTag({ property: 'og:image:alt', content: media.title });
      }
      const replacedUrlParams = new URLSearchParams({ ...this.route.snapshot.queryParams }).toString();
      this.location.replaceState('/details/' + media._id + '-' + media.slug.substring(0, 100), replacedUrlParams);
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

  updateTitleResizeOptions() {
    if (!this.isMobile) {
      this.titleResizes = [
        { length: 50, size: '28px', lineHeight: '32px' },
        { length: 75, size: '24px', lineHeight: '28px' },
        { length: 100, size: '18px', lineHeight: '22px' }
      ];
      this.originalTitleResizes = [
        { length: 75, size: '20px', lineHeight: '24px' },
        { length: 100, size: '16px', lineHeight: '20px' }
      ];
    } else {
      this.titleResizes = [
        { length: 50, size: '18px', lineHeight: '22px' },
        { length: 75, size: '14px', lineHeight: '18px' },
        { length: 100, size: '12px', lineHeight: '16px' }
      ];
      this.originalTitleResizes = [
        { length: 50, size: '16px', lineHeight: '20px' },
        { length: 75, size: '12px', lineHeight: '16px' }
      ];
    }
  }

  ngOnDestroy(): void {
    this.title.setTitle(SITE_NAME);
    this.meta.removeTag('name="description"');
    this.meta.removeTag('property="og:site_name"');
    this.meta.removeTag('property="og:title"');
    this.meta.removeTag('property="og:description"');
    this.meta.removeTag('property="og:image"');
    this.meta.removeTag('property="og:image:url"');
    this.meta.removeTag('property="og:image:secure_url"');
    this.meta.removeTag('property="og:image:width"');
    this.meta.removeTag('property="og:image:height"');
    this.meta.removeTag('property="og:image:type"');
    this.meta.removeTag('property="og:image:alt"');
    this.meta.updateTag({ name: 'theme-color', content: SITE_THEME_COLOR });
    this.dialogService.dialogComponentRefMap.forEach(dialogRef => {
      dialogRef.instance.close();
    });
  }
}
