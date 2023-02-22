import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { TRANSLOCO_SCOPE } from '@ngneat/transloco';

import { MediaType } from '../../../core/enums';
import { Media, Paginated } from '../../../core/models';
import { track_Id } from '../../../core/utils';

@Component({
  selector: 'app-media-top',
  templateUrl: './media-top.component.html',
  styleUrls: ['./media-top.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: TRANSLOCO_SCOPE,
      useValue: 'media'
    }
  ]
})
export class MediaTopComponent implements OnInit {
  MediaType = MediaType;
  @Input() loading: boolean = false;
  @Input() mediaList?: Paginated<Media>;
  @Input() itemLimit: number = 5;
  @Input() elements: string[] = [];
  track_Id = track_Id;

  skeletonArray: Array<any>;

  constructor() {
    this.skeletonArray = new Array(this.itemLimit);
  }

  ngOnInit(): void {
  }

}
