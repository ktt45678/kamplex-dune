import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslocoService, TRANSLOCO_SCOPE } from '@ngneat/transloco';
import { DialogService } from 'primeng/dynamicdialog';
import { debounceTime, finalize, first, forkJoin, map, of, takeUntil } from 'rxjs';

import { AppErrorCode } from '../../../../../core/enums';
import { UserDetails } from '../../../../../core/models';
import { AuthService, DestroyService, UsersService } from '../../../../../core/services';
import { ImageEditorComponent } from '../../../../../shared/dialogs/image-editor';
import { dataURItoFile, detectFormChange } from '../../../../../core/utils';
import {
  IMAGE_PREVIEW_SIZE, UPLOAD_AVATAR_MIN_HEIGHT, UPLOAD_AVATAR_MIN_WIDTH, UPLOAD_AVATAR_RATIO, UPLOAD_AVATAR_SIZE,
  UPLOAD_AVATAR_TYPES, UPLOAD_BANNER_MIN_HEIGHT, UPLOAD_BANNER_MIN_WIDTH, UPLOAD_BANNER_SIZE, UPLOAD_BANNER_TYPES
} from '../../../../../../environments/config';

interface UpdateProfileForm {
  nickname: FormControl<string | null>;
  about: FormControl<string | null>;
}

@Component({
  selector: 'app-profile-settings',
  templateUrl: './profile-settings.component.html',
  styleUrls: ['./profile-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    DestroyService,
    {
      provide: TRANSLOCO_SCOPE,
      useValue: 'common'
    }
  ],
  animations: [
    trigger('updateProfileToast', [
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
export class ProfileSettingsComponent implements OnInit, OnDestroy {
  currentUser: UserDetails | null = null;
  updateProfileForm: FormGroup<UpdateProfileForm>;
  avatarPreviewName?: string;
  avatarPreviewUri?: string;
  bannerPreviewName?: string;
  bannerPreviewUri?: string;
  previewAbout: string | null = null;
  updateProfileInitValue: {} = {};
  updatingAvatar: boolean = false;
  updatingBanner: boolean = false;
  removingAvatar: boolean = false;
  removingBanner: boolean = false;
  updatingProfile: boolean = false;
  hasUnsavedChanges: boolean = false;
  isSavingChanges: boolean = false;

  constructor(private ref: ChangeDetectorRef, private renderer: Renderer2, private translocoService: TranslocoService,
    private dialogService: DialogService, private authService: AuthService, private usersService: UsersService,
    private destroyService: DestroyService) {
    this.updateProfileForm = new FormGroup<UpdateProfileForm>({
      nickname: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(32)] }),
      about: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(3000)] })
    });
  }

  ngOnInit(): void {
    this.authService.currentUser$.pipe(takeUntil(this.destroyService)).subscribe((user) => {
      this.currentUser = user;
      this.ref.markForCheck();
    });
    this.authService.currentUser$.pipe(first()).subscribe((user) => {
      if (!user) return;
      this.patchUpdateProfileForm(user);
    });
    this.updateProfileForm.controls.about.valueChanges
      .pipe(debounceTime(200), takeUntil(this.destroyService))
      .subscribe((value) => {
        this.previewAbout = value;
        this.ref.markForCheck();
      });
  }

  patchUpdateProfileForm(user: UserDetails): void {
    this.updateProfileForm.patchValue({
      nickname: user.nickname,
      about: user.about
    }, { emitEvent: false });
    this.previewAbout = user.about || null;
    this.updateProfileInitValue = { ...this.updateProfileForm.value };
    this.detectUpdateProfileFormChange();
  }

  onAppMenuClick(element: HTMLElement, opened: boolean): void {
    this.renderer[opened ? 'removeClass' : 'addClass'](element, 'tw-invisible');
    this.renderer[opened ? 'addClass' : 'removeClass'](element, 'tw-visible');
  }

  onInputAvatarChange(event: Event): void {
    const element = <HTMLInputElement>event.target;
    if (!element.files?.length || !this.currentUser) return;
    this.handleAvatarFile(element.files[0]);
  }

  handleAvatarFile(file: File): void {
    if (!UPLOAD_AVATAR_TYPES.includes(file.type))
      throw new Error(AppErrorCode.UPLOAD_AVATAR_UNSUPORTED);
    if (file.size > IMAGE_PREVIEW_SIZE)
      throw new Error(AppErrorCode.UPLOAD_PLAYLIST_THUMBNAIL_TOO_LARGE);
    this.editImage({
      aspectRatioWidth: UPLOAD_AVATAR_RATIO[0], aspectRatioHeight: UPLOAD_AVATAR_RATIO[1],
      minWidth: UPLOAD_AVATAR_MIN_WIDTH, minHeight: UPLOAD_AVATAR_MIN_HEIGHT,
      imageFile: file, maxSize: UPLOAD_AVATAR_SIZE
    }).subscribe((result: string[] | null) => {
      if (!result) return;
      const [previewUri, name] = result;
      this.avatarPreviewName = name;
      this.avatarPreviewUri = previewUri;
      this.updatingAvatar = true;
      this.hasUnsavedChanges = true;
      this.ref.markForCheck();
    });
  }

  onInputBannerChange(event: Event): void {
    const element = <HTMLInputElement>event.target;
    if (!element.files?.length || !this.currentUser) return;
    this.handleBannerFile(element.files[0]);
  }

  handleBannerFile(file: File): void {
    if (!UPLOAD_BANNER_TYPES.includes(file.type))
      throw new Error(AppErrorCode.UPLOAD_BANNER_UNSUPORTED);
    if (file.size > IMAGE_PREVIEW_SIZE)
      throw new Error(AppErrorCode.UPLOAD_PLAYLIST_THUMBNAIL_TOO_LARGE);
    this.editImage({
      minWidth: UPLOAD_BANNER_MIN_WIDTH, minHeight: UPLOAD_BANNER_MIN_HEIGHT,
      imageFile: file, maxSize: UPLOAD_BANNER_SIZE
    }).subscribe((result: string[] | null) => {
      if (!result) return;
      const [previewUri, name] = result;
      this.bannerPreviewName = name;
      this.bannerPreviewUri = previewUri;
      this.updatingBanner = true;
      this.hasUnsavedChanges = true;
      this.ref.markForCheck();
    });
  }

  editImage(data: any) {
    const dialogRef = this.dialogService.open(ImageEditorComponent, {
      data: data,
      header: this.translocoService.translate('common.imageEditor.header'),
      width: '700px',
      modal: true,
      dismissableMask: false,
      styleClass: 'p-dialog-header-sm'
    });
    return dialogRef.onClose.pipe(first());
  }

  detectUpdateProfileFormChange(): void {
    if (!this.currentUser) return;
    detectFormChange(this.updateProfileForm, this.updateProfileInitValue, () => {
      this.hasUnsavedChanges = false;
      this.updatingProfile = false;
    }, () => {
      this.hasUnsavedChanges = true;
      this.updatingProfile = true;
    }).pipe(takeUntil(this.destroyService)).subscribe();
  }

  onRemoveAvatar(): void {
    this.removingAvatar = true;
    this.hasUnsavedChanges = true;
    this.onUpdateAvatarCancel();
  }

  onUpdateAvatarCancel(): void {
    this.avatarPreviewName = undefined;
    this.avatarPreviewUri = undefined;
    this.updatingAvatar = false;
  }

  onRemoveBanner(): void {
    this.removingBanner = true;
    this.hasUnsavedChanges = true;
    this.onUpdateBannerCancel();
  }

  onUpdateBannerCancel(): void {
    this.bannerPreviewName = undefined;
    this.bannerPreviewUri = undefined;
    this.updatingBanner = false;
  }

  onUpdateProfileFormCancel(): void {
    this.updateProfileForm.reset(this.updateProfileInitValue);
    this.detectUpdateProfileFormChange();
  }

  updateProfile(userId: string) {
    if (this.updateProfileForm.invalid) return of(null);
    this.updateProfileForm.disable({ emitEvent: false });
    const formValue = this.updateProfileForm.getRawValue();
    return this.usersService.update(userId, {
      nickname: formValue.nickname,
      about: formValue.about
    }).pipe(finalize(() => {
      this.updateProfileForm.enable({ emitEvent: false });
    }), takeUntil(this.destroyService));
  }

  uploadAvatar(userId: string) {
    if (!this.avatarPreviewName) return of(null);
    const avatarFile = dataURItoFile(this.avatarPreviewUri!, this.avatarPreviewName);
    return this.usersService.uploadAvatar(userId, avatarFile);
  }

  removeAvatar(userId: string) {
    if (!this.removingAvatar) return of(null);
    return this.usersService.deleteAvatar(userId).pipe(map(() => true));
  }

  uploadBanner(userId: string) {
    if (!this.bannerPreviewName) return of(null);
    const bannerFile = dataURItoFile(this.bannerPreviewUri!, this.bannerPreviewName);
    return this.usersService.uploadBanner(userId, bannerFile);
  }

  removeBanner(userId: string) {
    if (!this.removingBanner) return of(null);
    return this.usersService.deleteBanner(userId).pipe(map(() => true));
  }

  submitProfileUpdate(): void {
    if (!this.currentUser) return;
    this.isSavingChanges = true;
    const operations = {
      uploadAvatarResult: this.uploadAvatar(this.currentUser._id),
      removeAvatarResult: this.removeAvatar(this.currentUser._id),
      uploadBannerResult: this.uploadBanner(this.currentUser._id),
      removeBannerResult: this.removeBanner(this.currentUser._id),
      updateProfileResult: this.updateProfile(this.currentUser._id)
    };
    forkJoin(operations).pipe(takeUntil(this.destroyService))
      .subscribe(({ uploadAvatarResult, removeAvatarResult, uploadBannerResult, removeBannerResult, updateProfileResult }) => {
        if (uploadAvatarResult) {
          const { avatarUrl, thumbnailAvatarUrl, smallAvatarUrl, fullAvatarUrl, avatarColor } = uploadAvatarResult;
          const updatedUser: UserDetails = {
            ...this.currentUser!, avatarUrl, thumbnailAvatarUrl, smallAvatarUrl, fullAvatarUrl,
            avatarColor
          };
          this.authService.currentUser = updatedUser;
          this.onUpdateAvatarCancel();
        }
        if (removeAvatarResult) {
          const updatedUser: UserDetails = {
            ...this.currentUser!, avatarUrl: undefined, thumbnailAvatarUrl: undefined, smallAvatarUrl: undefined,
            fullAvatarUrl: undefined, avatarColor: undefined, avatarPlaceholder: undefined
          };
          this.authService.currentUser = updatedUser;
          this.removingAvatar = false;
        }
        if (uploadBannerResult) {
          const { bannerUrl, thumbnailBannerUrl, smallBannerUrl, fullBannerUrl, bannerColor } = uploadBannerResult;
          const updatedUser: UserDetails = {
            ...this.currentUser!, bannerUrl, thumbnailBannerUrl, smallBannerUrl, fullBannerUrl,
            bannerColor
          };
          this.authService.currentUser = updatedUser;
          this.onUpdateBannerCancel();
        }
        if (removeBannerResult) {
          const updatedUser: UserDetails = {
            ...this.currentUser!, bannerUrl: undefined, thumbnailBannerUrl: undefined, smallBannerUrl: undefined,
            fullBannerUrl: undefined, bannerColor: undefined, bannerPlaceholder: undefined
          };
          this.authService.currentUser = updatedUser;
          this.removingBanner = false;
        }
        if (updateProfileResult) {
          const updatedUser = { ...this.currentUser!, nickname: updateProfileResult.nickname, about: updateProfileResult.about };
          this.authService.currentUser = updatedUser;
          this.updatingProfile = false;
        }
      }).add(() => {
        this.isSavingChanges = false;
        if (!this.updatingAvatar && !this.removingAvatar && !this.updatingBanner && !this.removingBanner && !this.updatingProfile)
          this.hasUnsavedChanges = false;
        this.updateProfileInitValue = { ...this.updateProfileForm.value };
        this.detectUpdateProfileFormChange();
        this.ref.markForCheck();
      });
  }

  resetProfileUpdate(): void {
    if (this.updatingAvatar)
      this.onUpdateAvatarCancel();
    if (this.updatingBanner)
      this.onUpdateBannerCancel();
    if (this.removingAvatar)
      this.removingAvatar = false;
    if (this.removingBanner)
      this.removingBanner = false;
    if (this.updatingProfile) {
      this.onUpdateProfileFormCancel();
      this.updatingProfile = false;
    }
    this.hasUnsavedChanges = false;
  }

  ngOnDestroy(): void {
    this.dialogService.dialogComponentRefMap.forEach(dialogRef => {
      dialogRef.instance.close();
    });
  }
}
