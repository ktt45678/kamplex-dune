import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, Renderer2 } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs';

import { Media, RatingDetails, UserDetails } from '../../../../core/models';
import { AuthService, DestroyService } from '../../../../core/services';

@Component({
  selector: 'app-rating-card [rating]',
  templateUrl: './rating-card.component.html',
  styleUrls: ['./rating-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RatingCardComponent implements OnInit {
  @Input() rating!: RatingDetails;
  @Output() onAddToPlaylist = new EventEmitter<Media>();
  @Output() onDelete = new EventEmitter<RatingDetails>();
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

  onRatingMenuClick(button: HTMLButtonElement, opened: boolean): void {
    this.renderer[opened ? 'removeClass' : 'addClass'](button, 'tw-invisible');
    this.renderer[opened ? 'addClass' : 'removeClass'](button, 'tw-visible');
  }
}
