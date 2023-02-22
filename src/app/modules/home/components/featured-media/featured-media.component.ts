import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import SwiperCore, { Autoplay, Navigation, Pagination, Swiper, SwiperOptions } from 'swiper';

import { Media } from '../../../../core/models';
import { track_Id } from '../../../../core/utils';

SwiperCore.use([Autoplay, Navigation, Pagination]);

@Component({
  selector: 'app-featured-media',
  templateUrl: './featured-media.component.html',
  styleUrls: ['./featured-media.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeaturedMediaComponent implements OnInit {
  track_Id = track_Id;
  @Input() loading: boolean = false;
  @Input() swiperClass?: string;
  @Input() mediaList?: Media[];
  activeTabIndex: number = 0;
  previousSlide?: Element;
  swiperConfig: SwiperOptions = {
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

  constructor() { }

  ngOnInit(): void {
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
}
