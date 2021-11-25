import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';

import { MediaType } from '../../../core/enums';
import { Media, Paginated } from '../../../core/models';

@Component({
  selector: 'app-media-top',
  templateUrl: './media-top.component.html',
  styleUrls: ['./media-top.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MediaTopComponent implements OnInit {
  MediaType = MediaType;
  @Input() loading: boolean = false;
  @Input() mediaList?: Paginated<Media>;
  @Input() itemLimit: number = 30;

  skeletonArray: Array<any>;

  constructor() {
    this.skeletonArray = [].constructor(this.itemLimit);
  }

  ngOnInit(): void {
  }

  trackId(index: number, item: any): any {
    return item?._id || null;
  }

}
