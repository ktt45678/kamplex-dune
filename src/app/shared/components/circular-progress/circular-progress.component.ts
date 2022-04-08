import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'app-circular-progress',
  templateUrl: './circular-progress.component.html',
  styleUrls: ['./circular-progress.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CircularProgressComponent implements OnInit {
  _radius: number = 80;
  _strokeWidth: number = 2;
  normalizedRadius: number = 0;
  circumference: number = 0;

  @Input() set radius(value: number) {
    this._radius = value;
    this.calculateRadius();
  };
  @Input() set strokeWidth(value: number) {
    this._strokeWidth = value;
    this.calculateRadius();
  };
  @Input() percent: number = 0;
  @Input() styleClass?: string;

  constructor() {
  }

  ngOnInit(): void {
  }

  calculateRadius(): void {
    this.normalizedRadius = ((this._radius * 2) / 2) - (this._strokeWidth / 2);
    this.circumference = this.normalizedRadius * 2 * Math.PI;
  }

}
