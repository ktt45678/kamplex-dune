import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'player-subtitle-icon',
  templateUrl: './subtitle-icon.component.html',
  styles: [
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubtitleIconComponent {
  @Input() enabled: boolean = false;
}
