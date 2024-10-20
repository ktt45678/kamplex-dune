import { animate, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { TranslocoService } from '@ngneat/transloco';
import { first, map, takeUntil } from 'rxjs';

import { UserDetails } from '../../../../../core/models';
import { LanguageOptionDto } from '../../../../../core/dto/common';
import { AuthService, UsersService, DestroyService } from '../../../../../core/services';
import { detectFormChange } from '../../../../../core/utils';

interface UpdateMediaForm {
  historyLimit: FormControl<number>;
  paused: FormControl<boolean>;
  prefAudioLang: FormControl<boolean>;
  prefAudioLangList: FormControl<string[]>;
  prefSubtitleLang: FormControl<boolean>;
  prefSubtitleLangList: FormControl<string[]>;
}

@Component({
  selector: 'app-media-settings',
  templateUrl: './media-settings.component.html',
  styleUrls: ['./media-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DestroyService],
  animations: [
    trigger('updateMediaToast', [
      transition(':enter', [
        style({ transform: 'translateY(100%)', opacity: 0 }),
        animate('200ms ease-in-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        style({ transform: 'translateY(0)', opacity: 1 }),
        animate('200ms ease-in-out', style({ transform: 'translateY(100%)', opacity: 0 }))
      ])
    ])
  ]
})
export class MediaSettingsComponent implements OnInit {
  currentUser: UserDetails | null = null;
  updateMediaForm: FormGroup<UpdateMediaForm>;
  updateMediaInitValue: object = {};
  hasUnsavedChanges: boolean = false;
  languageList = signal<LanguageOptionDto[]>([]);

  constructor(private ref: ChangeDetectorRef, private translocoService: TranslocoService, private authService: AuthService,
    private usersService: UsersService, private destroyService: DestroyService) {
    this.updateMediaForm = new FormGroup<UpdateMediaForm>({
      historyLimit: new FormControl(),
      paused: new FormControl(),
      prefAudioLang: new FormControl(),
      prefAudioLangList: new FormControl([], { nonNullable: true }),
      prefSubtitleLang: new FormControl(),
      prefSubtitleLangList: new FormControl([], { nonNullable: true })
    });
  }

  ngOnInit(): void {
    this.authService.currentUser$.pipe(takeUntil(this.destroyService)).subscribe((user) => {
      this.currentUser = user;
      this.ref.markForCheck();
    });
    this.authService.currentUser$.pipe(first()).subscribe((user) => {
      if (!user) return;
      this.patchUpdateMediaForm(user);
    });
    this.getLanguageList().subscribe(languages => {
      this.languageList.set([...languages, { label: 'Default', value: 'default' }]);
    });
  }

  patchUpdateMediaForm(user: UserDetails): void {
    const historySettings = user.settings!.history;
    const playerSettings = user.settings!.player;
    this.updateMediaForm.patchValue({
      historyLimit: historySettings.limit || 90,
      paused: historySettings.paused || false,
      prefAudioLang: playerSettings.prefAudioLang || false,
      prefAudioLangList: playerSettings.prefAudioLangList || ['default'],
      prefSubtitleLang: playerSettings.prefSubtitleLang || false,
      prefSubtitleLangList: playerSettings.prefSubtitleLangList || ['default']
    });
    this.updateMediaInitValue = { ...this.updateMediaForm.value };
    this.detectUpdateMediaFormChange();
  }

  detectUpdateMediaFormChange(): void {
    if (!this.currentUser) return;
    detectFormChange(this.updateMediaForm, this.updateMediaInitValue, () => {
      this.hasUnsavedChanges = false;
    }, () => {
      this.hasUnsavedChanges = true;
    }).pipe(takeUntil(this.destroyService)).subscribe();
  }

  resetMediaUpdate(): void {
    this.updateMediaForm.reset(this.updateMediaInitValue);
    this.detectUpdateMediaFormChange();
    this.hasUnsavedChanges = false;
  }

  onUpdateMediaFormSubmit() {
    if (this.updateMediaForm.invalid) return;
    this.updateMediaForm.disable({ emitEvent: false });
    const formValue = this.updateMediaForm.getRawValue();
    return this.usersService.updateSettings(this.currentUser!._id, {
      history: {
        limit: formValue.historyLimit,
        paused: formValue.paused
      },
      player: {
        prefAudioLang: formValue.prefAudioLang,
        prefAudioLangList: formValue.prefAudioLangList,
        prefSubtitleLang: formValue.prefSubtitleLang,
        prefSubtitleLangList: formValue.prefSubtitleLangList
      }
    }).subscribe(settings => {
      const updatedUser: UserDetails = { ...this.currentUser!, settings };
      this.authService.currentUser = updatedUser;
      this.hasUnsavedChanges = false;
    }).add(() => {
      this.updateMediaForm.enable({ emitEvent: false });
      this.updateMediaInitValue = { ...this.updateMediaForm.value };
      this.detectUpdateMediaFormChange();
      this.ref.markForCheck();
    });
  }

  getLanguageList() {
    return this.translocoService.selectTranslation('languages').pipe(first(), map(t => {
      const languageOptions: LanguageOptionDto[] = [];
      for (let key in t) {
        languageOptions.push({
          label: t[key],
          value: key
        });
      }
      return languageOptions;
    }));
  }
}
