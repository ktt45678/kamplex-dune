import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, Renderer2 } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs';

import { HistoryGroupable, Media, UserDetails } from '../../../../core/models';
import { AuthService, DestroyService } from '../../../../core/services';

@Component({
  selector: 'app-history-card [history]',
  templateUrl: './history-card.component.html',
  styleUrls: ['./history-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HistoryCardComponent implements OnInit {
  @Input() history!: HistoryGroupable;
  @Output() onAddToPlaylist = new EventEmitter<Media>();
  @Output() onPauseAndUnpause = new EventEmitter<{ history: HistoryGroupable, originalEvent: MouseEvent }>();
  @Output() onDelete = new EventEmitter<HistoryGroupable>();
  userId: string | null = null;
  currentUser!: UserDetails | null;

  constructor(public ref: ChangeDetectorRef, private renderer: Renderer2, private route: ActivatedRoute,
    private authService: AuthService, private destroyService: DestroyService) { }

  ngOnInit(): void {
    this.route.parent?.paramMap.pipe(takeUntil(this.destroyService)).subscribe(params => {
      this.userId = params.get('id');
      this.ref.markForCheck();
    });
    this.authService.currentUser$.pipe(takeUntil(this.destroyService)).subscribe(user => {
      this.currentUser = user;
      this.ref.markForCheck();
    });
  }

  onHistoryMenuClick(button: HTMLButtonElement, opened: boolean): void {
    this.renderer[opened ? 'removeClass' : 'addClass'](button, 'tw-invisible');
    this.renderer[opened ? 'addClass' : 'removeClass'](button, 'tw-visible');
  }
}
