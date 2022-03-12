import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-create-episode',
  templateUrl: './create-episode.component.html',
  styleUrls: ['./create-episode.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateEpisodeComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
