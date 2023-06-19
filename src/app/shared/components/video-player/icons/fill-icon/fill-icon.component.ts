import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'player-fill-icon',
  templateUrl: './fill-icon.component.html',
  styles: [
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FillIconComponent {
  @Input() active: boolean = false;
}
