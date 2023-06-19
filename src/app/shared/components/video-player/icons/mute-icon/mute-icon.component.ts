import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'player-mute-icon',
  templateUrl: './mute-icon.component.html',
  styles: [
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MuteIconComponent {
  @Input() muted: boolean = false;
  @Input() volume: number = 0;
}
