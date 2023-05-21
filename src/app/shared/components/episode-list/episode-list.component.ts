import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { TRANSLOCO_SCOPE } from '@ngneat/transloco';

import { MediaDetails, TVEpisode } from '../../../core/models';
import { trackId } from '../../../core/utils';

@Component({
  selector: 'app-episode-list',
  templateUrl: './episode-list.component.html',
  styleUrls: ['./episode-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: TRANSLOCO_SCOPE,
      useValue: 'media'
    }
  ]
})
export class EpisodeListComponent implements OnInit {
  @Input() media?: MediaDetails;
  @Input() episodeList?: TVEpisode[];
  @Input() loading: boolean = false;
  @Input() stillStyleClass: string = 'tw-w-full xs:tw-w-28 sm:tw-w-32 tw-flex-shrink-0';
  @Input() infoStyleClass: string = 'tw-w-full xs:tw-w-auto tw-pl-2 tw-py-1';
  @Input() dateAiredStyleClass: string = 'tw-text-sm';
  skeletonArray: Array<any>;
  trackId = trackId;

  constructor() {
    this.skeletonArray = new Array(5);
  }

  ngOnInit(): void {
  }

}
