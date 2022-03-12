import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-update-episode',
  templateUrl: './update-episode.component.html',
  styleUrls: ['./update-episode.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UpdateEpisodeComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
