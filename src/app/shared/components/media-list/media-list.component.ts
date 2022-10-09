import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { TRANSLOCO_SCOPE } from '@ngneat/transloco';

import { Media, Paginated } from '../../../core/models';
import { MediaType } from '../../../core/enums';

@Component({
  selector: 'app-media-list',
  templateUrl: './media-list.component.html',
  styleUrls: ['./media-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: TRANSLOCO_SCOPE,
      useValue: 'media'
    }
  ]
})
export class MediaListComponent implements OnInit {
  MediaType = MediaType;
  @Input() loading: boolean = false;
  @Input() mediaList?: Paginated<Media>;
  @Input() itemLimit: number = 30;
  @Input() viewMode: number = 1;
  skeletonArray: Array<any>;

  constructor() {
    this.skeletonArray = [].constructor(this.itemLimit);
  }

  ngOnInit(): void {
  }

  trackId(index: number, item: any): any {
    return item?._id;
  }

}
