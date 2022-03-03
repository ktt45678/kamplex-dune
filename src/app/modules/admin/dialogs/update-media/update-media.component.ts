import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-update-media',
  templateUrl: './update-media.component.html',
  styleUrls: ['./update-media.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UpdateMediaComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
