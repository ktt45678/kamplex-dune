import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'player-play-circle-icon',
  templateUrl: './play-circle-icon.component.html',
  styles: [
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayCircleIconComponent {
  @Input() styleClass?: string;
}
