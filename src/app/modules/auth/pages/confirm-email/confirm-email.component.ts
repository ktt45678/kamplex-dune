import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AuthService } from '../../../../core/services';

@Component({
  selector: 'app-confirm-email',
  templateUrl: './confirm-email.component.html',
  styleUrls: ['./confirm-email.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmEmailComponent implements OnInit {
  id: string | null;
  activationCode: string | null;
  loading: boolean = false;
  success: boolean = false;

  constructor(private ref: ChangeDetectorRef, private route: ActivatedRoute, private authService: AuthService) {
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
  }

}
