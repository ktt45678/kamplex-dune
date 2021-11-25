import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { TRANSLOCO_SCOPE } from '@ngneat/transloco';

@Component({
  selector: 'app-home-footer',
  templateUrl: './home-footer.component.html',
  styleUrls: ['./home-footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: TRANSLOCO_SCOPE,
      useValue: 'homeFooter'
    }
  ]
})
export class HomeFooterComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
