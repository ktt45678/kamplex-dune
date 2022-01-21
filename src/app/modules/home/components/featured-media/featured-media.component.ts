import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import SwiperCore, { Autoplay, Navigation, Pagination, SwiperOptions } from 'swiper';

import { Media } from '../../../../core/models';

SwiperCore.use([Autoplay, Navigation, Pagination]);

@Component({
  selector: 'app-featured-media',
  templateUrl: './featured-media.component.html',
  styleUrls: ['./featured-media.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeaturedMediaComponent implements OnInit {
  @Input() swiperClass?: string;
  @Input() mediaList?: Media[];
  swiperConfig: SwiperOptions = {
    autoplay: {
      delay: 8000,
      pauseOnMouseEnter: true,
      disableOnInteraction: true
    },
    navigation: true,
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

  onFeaturedSwiperKeydown(event: KeyboardEvent) {
    event.preventDefault();
  }

  trackId(index: number, item: any): any {
    return item?._id || null;
  }

}
