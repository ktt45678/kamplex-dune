import { Component, OnInit, ChangeDetectionStrategy, Input, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-tab-panel',
  templateUrl: './tab-panel.component.html',
  styleUrls: ['./tab-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabPanelComponent implements OnInit {
  @Input() header: string = '';

  active: boolean = false;

  constructor(private ref: ChangeDetectorRef) {
  }

  ngOnInit(): void {
  }

  setActive(value: boolean): void {
    this.active = value;
    this.ref.markForCheck();
  }

}
