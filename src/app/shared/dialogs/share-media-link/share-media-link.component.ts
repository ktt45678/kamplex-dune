import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';

import { SharingOption } from './interfaces';
import { trackLabel } from '../../../core/utils';

@Component({
  selector: 'app-share-media-link',
  templateUrl: './share-media-link.component.html',
  styleUrls: ['./share-media-link.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShareMediaLinkComponent {
  trackLabel = trackLabel;
  options: SharingOption[];

  constructor(private config: DynamicDialogConfig<SharingOption[]>) {
    this.options = this.config.data || [];
  }
}
