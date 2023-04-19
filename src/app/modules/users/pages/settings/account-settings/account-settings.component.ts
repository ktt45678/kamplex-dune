import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { first, takeUntil } from 'rxjs';

import { ShortDate, UserDetails } from '../../../../../core/models';
import { AuthService, DestroyService } from '../../../../../core/services';
import { UpdateBirthdateComponent } from '../../../dialogs/update-birthdate';
import { UpdateEmailComponent } from '../../../dialogs/update-email';
import { UpdatePasswordComponent } from '../../../dialogs/update-password';
import { UpdateUsernameComponent } from '../../../dialogs/update-username';

@Component({
  selector: 'app-account-settings',
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DialogService, DestroyService]
})
export class AccountSettingsComponent implements OnInit, OnDestroy {
  currentUser: UserDetails | null = null;

  constructor(private ref: ChangeDetectorRef, private dialogService: DialogService,
    private authService: AuthService, private destroyService: DestroyService) { }

  ngOnInit(): void {
    this.authService.currentUser$.pipe(takeUntil(this.destroyService)).subscribe((user) => {
      this.currentUser = user;
      this.ref.markForCheck();
    });
  }

  showUpdateUsernameDialog(): void {
    const dialogRef = this.dialogService.open(UpdateUsernameComponent, {
      data: { ...this.currentUser },
      width: '500px',
      modal: true,
      styleClass: 'p-dialog-header-sm',
      contentStyle: { 'margin-top': '-1.5rem' },
      dismissableMask: true,
      minimal: true
    });
    dialogRef.onClose.pipe(first()).subscribe((username: string) => {
      if (!username || !this.currentUser) return;
      const updatedUser = { ...this.currentUser, username };
      this.authService.currentUser = updatedUser;
      this.ref.markForCheck();
    });
  }

  showUpdateEmailDialog(): void {
    const dialogRef = this.dialogService.open(UpdateEmailComponent, {
      data: { ...this.currentUser },
      width: '500px',
      modal: true,
      styleClass: 'p-dialog-header-sm',
      contentStyle: { 'margin-top': '-1.5rem' },
      dismissableMask: true,
      minimal: true
    });
    dialogRef.onClose.pipe(first()).subscribe((email: string) => {
      if (!email || !this.currentUser) return;
      const updatedUser = { ...this.currentUser, email };
      this.authService.currentUser = updatedUser;
      this.ref.markForCheck();
    });
  }

  showUpdateBirthdateDialog(): void {
    const dialogRef = this.dialogService.open(UpdateBirthdateComponent, {
      data: { ...this.currentUser },
      width: '500px',
      modal: true,
      styleClass: 'p-dialog-header-sm',
      contentStyle: { 'margin-top': '-1.5rem' },
      dismissableMask: true,
      minimal: true
    });
    dialogRef.onClose.pipe(first()).subscribe((birthdate: ShortDate) => {
      if (!birthdate || !this.currentUser) return;
      const updatedUser = { ...this.currentUser, birthdate };
      this.authService.currentUser = updatedUser;
      this.ref.markForCheck();
    });
  }

  showUpdatePasswordDialog(): void {
    const dialogRef = this.dialogService.open(UpdatePasswordComponent, {
      data: { ...this.currentUser },
      width: '500px',
      modal: true,
      styleClass: 'p-dialog-header-sm',
      contentStyle: { 'margin-top': '-1.5rem' },
      dismissableMask: true,
      minimal: true
    });
  }

  ngOnDestroy(): void {
    this.dialogService.dialogComponentRefMap.forEach(dialogRef => {
      dialogRef.instance.close();
    });
  }
}
