import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { filter, map, switchMap, takeUntil } from 'rxjs';

import { AuthService, DestroyService } from '../../../../core/services';

@Component({
  selector: 'app-confirm-email',
  templateUrl: './confirm-email.component.html',
  styleUrls: ['./confirm-email.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DestroyService]
})
export class ConfirmEmailComponent implements OnInit {
  id: string | null;
  activationCode: string | null;
  loading: boolean = false;
  success: boolean = false;

  constructor(private ref: ChangeDetectorRef, private route: ActivatedRoute, private authService: AuthService,
    private destroyService: DestroyService) {
    this.id = this.route.snapshot.queryParamMap.get('id');
    this.activationCode = this.route.snapshot.queryParamMap.get('code');
  }

  ngOnInit(): void {
    if (!this.id || !this.activationCode)
      return;
    this.loading = true;
    this.ref.markForCheck();
    this.authService.confirmEmail({
      id: this.id,
      activationCode: this.activationCode
    }).subscribe({
      next: () => {
        this.success = true;
      },
      error: () => {
        this.success = false;
      }
    }).add(() => {
      this.loading = false;
      this.ref.markForCheck();
    });
    /*
    this.route.queryParamMap.pipe(
      map(queryParams => ({ id: queryParams.get('id'), code: queryParams.get('code') })),
      filter((queryParams): queryParams is { id: string, code: string } => queryParams.id !== null && queryParams.code !== null),
      switchMap(queryParams => {
        this.loading = true;
        this.ref.markForCheck();
        return this.authService.confirmEmail({
          id: queryParams.id,
          activationCode: queryParams.code
        });
      }),
      takeUntil(this.destroyService)
    ).subscribe({
      next: () => {
        this.success = true;
        this.loading = false;
        this.ref.markForCheck();
      },
      error: () => {
        this.success = false;
        this.loading = false;
        this.ref.markForCheck();
      }
    });
    */
  }

}
