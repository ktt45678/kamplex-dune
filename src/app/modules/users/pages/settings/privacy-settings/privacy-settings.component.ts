import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { cloneDeep } from 'lodash-es';
import { catchError, debounceTime, first, of, switchMap, takeUntil, tap } from 'rxjs';

import { MediaVisibility, UserVisibility } from '../../../../../core/enums';
import { UserDetails } from '../../../../../core/models';
import { AuthService, DestroyService, UsersService } from '../../../../../core/services';

interface UpdatePrivacyForm {
  historyVisibility: FormControl<number>;
  ratingVisibility: FormControl<number>;
  defaultPlaylistVisibility: FormControl<number>;
}

@Component({
  selector: 'app-privacy-settings',
  templateUrl: './privacy-settings.component.html',
  styleUrls: ['./privacy-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DestroyService]
})
export class PrivacySettingsComponent implements OnInit {
  currentUser: UserDetails | null = null;
  updatePrivacyForm: FormGroup<UpdatePrivacyForm>;

  constructor(private ref: ChangeDetectorRef, private authService: AuthService, private usersService: UsersService,
    private destroyService: DestroyService) {
    this.updatePrivacyForm = new FormGroup<UpdatePrivacyForm>({
      historyVisibility: new FormControl(UserVisibility.PRIVATE, { nonNullable: true }),
      ratingVisibility: new FormControl(UserVisibility.PUBLIC, { nonNullable: true }),
      defaultPlaylistVisibility: new FormControl(MediaVisibility.UNLISTED, { nonNullable: true })
    });
  }

  ngOnInit(): void {
    this.authService.currentUser$.pipe(takeUntil(this.destroyService)).subscribe((user) => {
      this.currentUser = user;
      this.ref.markForCheck();
    });
    this.authService.currentUser$.pipe(first()).subscribe((user) => {
      if (!user) return;
      this.patchUpdatePrivacyForm(user);
    });
    this.detectFormUpdate();
  }

  patchUpdatePrivacyForm(user: UserDetails): void {
    this.updatePrivacyForm.patchValue({
      historyVisibility: user.settings!.historyList.visibility,
      ratingVisibility: user.settings!.ratingList.visibility,
      defaultPlaylistVisibility: user.settings!.playlist.visibility
    }, { emitEvent: false });
  }

  detectFormUpdate(): void {
    // History visibility
    this.updatePrivacyForm.controls.historyVisibility.valueChanges.pipe(debounceTime(500), switchMap(value => {
      return this.usersService.updateSettings(this.currentUser!._id, { historyList: { visibility: value } })
        .pipe(catchError(() => of(null)));
    }), tap(settings => {
      if (!settings) {
        this.updatePrivacyForm.controls.historyVisibility.setValue(this.currentUser!.settings!.historyList.visibility, {
          emitEvent: false
        });
        return;
      }
      const updatedUser = cloneDeep(this.currentUser!);
      updatedUser.settings!.historyList.visibility = settings!.historyList.visibility;
      this.authService.currentUser = updatedUser;
    }), takeUntil(this.destroyService)).subscribe();
    // Rating visibility
    this.updatePrivacyForm.controls.ratingVisibility.valueChanges.pipe(debounceTime(500), switchMap(value => {
      return this.usersService.updateSettings(this.currentUser!._id, { ratingList: { visibility: value } })
        .pipe(catchError(() => of(null)));
    }), tap(settings => {
      if (!settings) {
        this.updatePrivacyForm.controls.ratingVisibility.setValue(this.currentUser!.settings!.ratingList.visibility, {
          emitEvent: false
        });
        return;
      }
      const updatedUser = cloneDeep(this.currentUser!);
      updatedUser.settings!.ratingList.visibility = settings!.ratingList.visibility;
      this.authService.currentUser = updatedUser;
    }), takeUntil(this.destroyService)).subscribe();
    // Default playlist visibility
    this.updatePrivacyForm.controls.defaultPlaylistVisibility.valueChanges.pipe(debounceTime(500), switchMap(value => {
      return this.usersService.updateSettings(this.currentUser!._id, { playlist: { visibility: value } })
        .pipe(catchError(() => of(null)));
    }), tap(settings => {
      if (!settings) {
        this.updatePrivacyForm.controls.defaultPlaylistVisibility.setValue(this.currentUser!.settings!.playlist.visibility, {
          emitEvent: false
        });
        return;
      }
      const updatedUser = cloneDeep(this.currentUser!);
      updatedUser.settings!.playlist.visibility = settings!.playlist.visibility;
      this.authService.currentUser = updatedUser;
    }), takeUntil(this.destroyService)).subscribe();
  }
}
