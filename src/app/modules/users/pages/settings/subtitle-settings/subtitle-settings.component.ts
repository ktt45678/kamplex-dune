import { animate, style, transition, trigger } from '@angular/animations';
import { NgStyle } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { TranslocoService } from '@ngneat/transloco';
import { debounceTime, first, takeUntil } from 'rxjs';

import { DropdownOptionDto } from '../../../../../core/dto/media';
import { SubtitleOptions } from '../../../../../core/dto/users';
import { FontFamily, FontWeight, TextEdgeStyle } from '../../../../../core/enums';
import { UserDetails } from '../../../../../core/models';
import { AuthService, UsersService, DestroyService } from '../../../../../core/services';
import { detectFormChange, getFontFamily, getTextEdgeStyle, prepareColor, scaleFontSize, scaleFontWeight } from '../../../../../core/utils';

interface UpdateSubtitleForm {
  fontSize: FormControl<number>;
  fontFamily: FormControl<string | null>;
  fontWeight: FormControl<number | null>;
  textColor: FormControl<string | null>;
  textAlpha: FormControl<number>;
  textEdge: FormControl<number | null>;
  bgColor: FormControl<string | null>;
  bgAlpha: FormControl<number>;
  winColor: FormControl<string | null>;
  winAlpha: FormControl<number>;
}

@Component({
  selector: 'app-subtitle-settings',
  templateUrl: './subtitle-settings.component.html',
  styleUrls: ['./subtitle-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DestroyService],
  animations: [
    trigger('updateSubtitleToast', [
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
export class SubtitleSettingsComponent implements OnInit {
  currentUser: UserDetails | null = null;
  updateSubtitleForm: FormGroup<UpdateSubtitleForm>;
  fontFamilyList: DropdownOptionDto[] = [];
  fontWeightList: DropdownOptionDto[] = [];
  textEdgeStyleList: DropdownOptionDto[] = [];
  previewStyles: NgStyle['ngStyle'];
  updateSubtitleInitValue: object = {};
  hasUnsavedChanges: boolean = false;

  constructor(private ref: ChangeDetectorRef, private translocoService: TranslocoService, private authService: AuthService,
    private usersService: UsersService, private destroyService: DestroyService) {
    this.updateSubtitleForm = new FormGroup<UpdateSubtitleForm>({
      fontSize: new FormControl(),
      fontFamily: new FormControl(),
      fontWeight: new FormControl(),
      textColor: new FormControl(),
      textAlpha: new FormControl(),
      textEdge: new FormControl(),
      bgColor: new FormControl(),
      bgAlpha: new FormControl(),
      winColor: new FormControl(),
      winAlpha: new FormControl()
    });
  }

  ngOnInit(): void {
    this.authService.currentUser$.pipe(takeUntil(this.destroyService)).subscribe((user) => {
      this.currentUser = user;
      this.ref.markForCheck();
    });
    this.authService.currentUser$.pipe(first()).subscribe((user) => {
      if (!user) return;
      this.patchUpdateSubtitleForm(user);
      this.renderSubtitlePreview(this.updateSubtitleForm.value);
    });
    this.translocoService.langChanges$.pipe(first()).subscribe(() => {
      this.createDropdownOptions();
      this.ref.markForCheck();
    });
    this.updateSubtitleForm.valueChanges.pipe(debounceTime(200), takeUntil(this.destroyService)).subscribe(value => {
      this.renderSubtitlePreview(value);
      this.ref.markForCheck();
    });
  }

  patchUpdateSubtitleForm(user: UserDetails): void {
    const settings = user.settings!.subtitle;
    const textColor = settings.textColor != undefined ? ('#' + settings.textColor.toString(16)) : null;
    const backgroundColor = settings.bgColor != undefined ? ('#' + settings.bgColor.toString(16)) : null;
    const windowColor = settings.winColor != undefined ? ('#' + settings.winColor.toString(16)) : null;
    const textOpacity = settings.textAlpha != undefined ? settings.textAlpha : 100;
    const backgroundOpacity = settings.bgAlpha != undefined ? settings.bgAlpha : 100;
    const windowOpacity = settings.winAlpha != undefined ? settings.winAlpha : 100;
    this.updateSubtitleForm.patchValue({
      fontSize: settings.fontSize || 100,
      fontFamily: settings.fontFamily,
      fontWeight: settings.fontWeight || 400,
      textColor: textColor,
      textAlpha: textOpacity,
      textEdge: settings.textEdge,
      bgColor: backgroundColor,
      bgAlpha: backgroundOpacity,
      winColor: windowColor,
      winAlpha: windowOpacity
    });
    this.updateSubtitleInitValue = { ...this.updateSubtitleForm.value };
    this.detectUpdateSubtitleFormChange();
  }

  renderSubtitlePreview(value: typeof this.updateSubtitleForm.value): void {
    this.previewStyles = {
      'font-family': getFontFamily(value.fontFamily),
      'font-size': scaleFontSize(32, value.fontSize),
      'color': prepareColor(value.textColor, value.textAlpha),
      '--subtitle-font-weight': scaleFontWeight(value.fontWeight),
      '--subtitle-text-edge-style': getTextEdgeStyle(value.textEdge),
      '--subtitle-background-color': prepareColor(value.bgColor, value.bgAlpha, 'transparent'),
      '--subtitle-window-color': prepareColor(value.winColor, value.winAlpha, 'transparent')
    };
  }

  detectUpdateSubtitleFormChange(): void {
    if (!this.currentUser) return;
    detectFormChange(this.updateSubtitleForm, this.updateSubtitleInitValue, () => {
      this.hasUnsavedChanges = false;
    }, () => {
      this.hasUnsavedChanges = true;
    }).pipe(takeUntil(this.destroyService)).subscribe();
  }

  resetSubtitleUpdate(): void {
    this.updateSubtitleForm.reset(this.updateSubtitleInitValue);
    this.detectUpdateSubtitleFormChange();
    this.hasUnsavedChanges = false;
  }

  onUpdateSubtitleFormSubmit() {
    if (this.updateSubtitleForm.invalid) return;
    this.updateSubtitleForm.disable({ emitEvent: false });
    const formValue = this.updateSubtitleForm.getRawValue();
    const textColor = formValue.textColor != undefined ? parseInt(formValue.textColor.substring(1), 16) : null;
    const backgroundColor = formValue.bgColor != undefined ? parseInt(formValue.bgColor.substring(1), 16) : null;
    const windowColor = formValue.winColor != undefined ? parseInt(formValue.winColor.substring(1), 16) : null;
    const updateSubtitleOptions: SubtitleOptions = {
      fontSize: formValue.fontSize,
      fontFamily: formValue.fontFamily,
      fontWeight: formValue.fontWeight,
      textColor,
      textAlpha: formValue.textAlpha != undefined ? formValue.textAlpha : null,
      textEdge: formValue.textEdge != undefined ? formValue.textEdge : null,
      bgColor: backgroundColor,
      bgAlpha: formValue.bgAlpha != undefined ? formValue.bgAlpha : null,
      winColor: windowColor,
      winAlpha: formValue.winAlpha != undefined ? formValue.winAlpha : null
    };
    return this.usersService.updateSettings(this.currentUser!._id, {
      subtitle: updateSubtitleOptions
    }).pipe(takeUntil(this.destroyService)).subscribe(settings => {
      const updatedUser: UserDetails = { ...this.currentUser!, settings };
      this.authService.currentUser = updatedUser;
      this.hasUnsavedChanges = false;
    }).add(() => {
      this.updateSubtitleForm.enable({ emitEvent: false });
      this.updateSubtitleInitValue = { ...this.updateSubtitleForm.value };
      this.detectUpdateSubtitleFormChange();
      this.ref.markForCheck();
    });
  }

  createDropdownOptions(): void {
    this.fontFamilyList = [
      {
        label: this.translocoService.translate('media.subtitleFonts.default'),
        value: null
      },
      {
        label: this.translocoService.translate('media.subtitleFonts.arialSansSerif'),
        value: FontFamily.ARIAL_SANS_SERIF
      },
      {
        label: this.translocoService.translate('media.subtitleFonts.robotoSansSerif'),
        value: FontFamily.ROBOTO_SANS_SERIF
      },
      {
        label: this.translocoService.translate('media.subtitleFonts.helveticaSansSerif'),
        value: FontFamily.HELVETICA_SANS_SERIF
      },
      {
        label: this.translocoService.translate('media.subtitleFonts.verdanaSansSerif'),
        value: FontFamily.VERDANA_SANS_SERIF
      },
      {
        label: this.translocoService.translate('media.subtitleFonts.proportionalSansSerif'),
        value: FontFamily.PROPORTIONAL_SANS_SERIF
      },
      {
        label: this.translocoService.translate('media.subtitleFonts.monospaceSansSerif'),
        value: FontFamily.MONOSPACE_SANS_SERIF
      },
      {
        label: this.translocoService.translate('media.subtitleFonts.proportionalSerif'),
        value: FontFamily.PROPORTIONAL_SERIF
      },
      {
        label: this.translocoService.translate('media.subtitleFonts.monospaceSerif'),
        value: FontFamily.MONOSPACE_SERIF
      }
    ];
    this.fontWeightList = [
      { label: this.translocoService.translate('media.subtitleFontWeights.default'), value: null },
      //{ label: this.translocoService.translate('media.subtitleFontWeights.thin'), value: FontWeight.THIN },
      //{ label: this.translocoService.translate('media.subtitleFontWeights.extraLight'), value: FontWeight.EXTRA_LIGHT },
      //{ label: this.translocoService.translate('media.subtitleFontWeights.light'), value: FontWeight.LIGHT },
      { label: this.translocoService.translate('media.subtitleFontWeights.normal'), value: FontWeight.NORMAL },
      //{ label: this.translocoService.translate('media.subtitleFontWeights.medium'), value: FontWeight.MEDIUM },
      //{ label: this.translocoService.translate('media.subtitleFontWeights.semiBold'), value: FontWeight.SEMI_BOLD },
      { label: this.translocoService.translate('media.subtitleFontWeights.bold'), value: FontWeight.BOLD },
      { label: this.translocoService.translate('media.subtitleFontWeights.extraBold'), value: FontWeight.EXTRA_BOLD },
      //{ label: this.translocoService.translate('media.subtitleFontWeights.black'), value: FontWeight.BLACK }
    ];
    this.textEdgeStyleList = [
      { label: this.translocoService.translate('media.textEdgeStyles.default'), value: null },
      { label: this.translocoService.translate('media.textEdgeStyles.none'), value: TextEdgeStyle.NONE },
      { label: this.translocoService.translate('media.textEdgeStyles.outline'), value: TextEdgeStyle.OUTLINE },
      { label: this.translocoService.translate('media.textEdgeStyles.raised'), value: TextEdgeStyle.RAISED },
      { label: this.translocoService.translate('media.textEdgeStyles.depressed'), value: TextEdgeStyle.DEPRESSED },
      { label: this.translocoService.translate('media.textEdgeStyles.uniform'), value: TextEdgeStyle.UNIFORM },
      { label: this.translocoService.translate('media.textEdgeStyles.dropshadow'), value: TextEdgeStyle.DROPSHADOW }
    ];
  }
}
