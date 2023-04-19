import { Component, ChangeDetectionStrategy, Input, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { DialogService } from 'primeng/dynamicdialog';
import SwiperCore, { Autoplay, Navigation, Pagination, Swiper, SwiperOptions } from 'swiper';

import { Media } from '../../../../core/models';
import { AuthService } from '../../../../core/services';
import { track_Id } from '../../../../core/utils';
import { AddToPlaylistComponent } from '../../../../shared/dialogs/add-to-playlist';

SwiperCore.use([Autoplay, Navigation, Pagination]);

@Component({
  selector: 'app-featured-media',
  templateUrl: './featured-media.component.html',
  styleUrls: ['./featured-media.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeaturedMediaComponent implements OnDestroy {
  track_Id = track_Id;
  @Input() loading: boolean = false;
  @Input() swiperClass?: string;
  @Input() mediaList?: Media[];
  activeTabIndex: number = 0;
  previousSlide?: Element;
  swiperConfig: SwiperOptions;

  constructor(private router: Router, private dialogService: DialogService, private translocoService: TranslocoService,
    private authService: AuthService) {
    this.swiperConfig = {
      autoplay: {
        delay: 8000,
        pauseOnMouseEnter: true,
        disableOnInteraction: true
      },
      navigation: {
        prevEl: '#swiper-nav-prev',
        nextEl: '#swiper-nav-next'
      },
      loop: true,
      pagination: {
        clickable: true,
      },
      allowTouchMove: false,
      slidesPerView: 1
    };
  }

  onSwiperSlideChange([swiper]: [Swiper]): void {
    if (this.previousSlide) {
      const buttons = this.previousSlide.querySelectorAll<HTMLButtonElement | HTMLAnchorElement>('button, a');
      buttons.forEach(button => {
        button.tabIndex = -1;
      });
    }
    const slide = swiper.slides[swiper.activeIndex];
    const buttons = slide.querySelectorAll<HTMLButtonElement | HTMLAnchorElement>('button, a');
    buttons.forEach(button => {
      button.tabIndex = 0;
    });
    this.previousSlide = slide;
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
