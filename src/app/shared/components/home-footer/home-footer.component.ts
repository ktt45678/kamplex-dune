import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home-footer',
  templateUrl: './home-footer.component.html',
  styleUrls: ['./home-footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeFooterComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
