import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { takeUntil } from 'rxjs';
import { addDays } from 'date-fns';

import { AddTVEpisodeDto, DropdownOptionDto } from '../../../../core/dto/media';
import { MediaDetails, TVEpisode } from '../../../../core/models';
import { DestroyService, ItemDataService, MediaService } from '../../../../core/services';
import { shortDate } from '../../../../core/validators';
import { ShortDateForm } from '../../../../core/interfaces/forms';

interface CreateEpisodeForm {
  episodeNumber: FormControl<number>;
  name: FormControl<string>;
  overview: FormControl<string>;
  runtime: FormControl<number | null>;
  airDate: FormGroup<ShortDateForm>;
  visibility: FormControl<number>;
}

@Component({
  selector: 'app-create-episode',
  templateUrl: './create-episode.component.html',
  styleUrls: ['./create-episode.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ItemDataService, DestroyService]
})
export class CreateEpisodeComponent implements OnInit {
  isCreatingEpisode: boolean = false;
  createEpisodeForm: FormGroup<CreateEpisodeForm>;
  days: DropdownOptionDto[] = [];
  months: DropdownOptionDto[] = [];
  years: DropdownOptionDto[] = [];

  constructor(private ref: ChangeDetectorRef, private dialogRef: DynamicDialogRef, private config: DynamicDialogConfig,
    private mediaService: MediaService, private itemDataService: ItemDataService, private destroyService: DestroyService) {
    this.createEpisodeForm = new FormGroup<CreateEpisodeForm>({
      episodeNumber: new FormControl(1, { nonNullable: true, validators: [Validators.required, Validators.min(0), Validators.max(10000)] }),
      name: new FormControl('', { nonNullable: true, validators: Validators.maxLength(500) }),
      overview: new FormControl('', { nonNullable: true, validators: [Validators.minLength(10), Validators.maxLength(2000)] }),
      runtime: new FormControl(null, [Validators.required, Validators.min(0), Validators.max(10000)]),
      airDate: new FormGroup<ShortDateForm>({
        day: new FormControl(null),
        month: new FormControl(null),
        year: new FormControl(null)
      }, { validators: shortDate('day', 'month', 'year', true) }),
      visibility: new FormControl(1, { nonNullable: true, validators: Validators.required }),
    });
  }

  ngOnInit(): void {
    const media: MediaDetails = this.config.data['media'];
    const episodes: TVEpisode[] = this.config.data['episodes'];
    if (episodes.length && episodes.length >= media.tv.episodeCount) {
      // Based on last created episode
      //const lastEpisode = episodes.reduce((prev, current) => (prev.episodeNumber > current.episodeNumber) ? prev : current);
      const lastEpisode = episodes[episodes.length - 1];
      const lastEpisodeAirDate = new Date(lastEpisode.airDate.year, lastEpisode.airDate.month - 1, lastEpisode.airDate.day);
      const nextWeekDate = addDays(lastEpisodeAirDate, 7);
      this.createEpisodeForm.patchValue({
        episodeNumber: lastEpisode.episodeNumber + 1,
        runtime: lastEpisode.runtime,
        airDate: {
          day: nextWeekDate.getDate(),
          month: nextWeekDate.getMonth() + 1,
          year: nextWeekDate.getFullYear()
        }
      });
    } else {
      // Based on media general info
      const lastAirDate = new Date(media.tv.lastAirDate.year, media.tv.lastAirDate.month - 1, media.tv.lastAirDate.day);
      const nextWeekDate = addDays(lastAirDate, 7);
      this.createEpisodeForm.patchValue({
        episodeNumber: media.tv.episodeCount + 1,
        runtime: media.runtime,
        airDate: {
          day: nextWeekDate.getDate(),
          month: nextWeekDate.getMonth() + 1,
          year: nextWeekDate.getFullYear()
        }
      });
    }
    this.days = this.itemDataService.createDateList();
    this.months = this.itemDataService.createMonthList();
    this.years = this.itemDataService.createYearList();
  }

  onCreateEpisodeFormSubmit(): void {
    if (this.createEpisodeForm.invalid) return;
    const mediaId = this.config.data['media']['_id'];
    this.isCreatingEpisode = true;
    const formValue = this.createEpisodeForm.getRawValue();
    const addTVEpisodeDto: AddTVEpisodeDto = ({
      episodeNumber: formValue.episodeNumber,
      name: formValue.name,
      overview: formValue.overview,
      runtime: formValue.runtime!,
      airDate: {
        day: formValue.airDate.day!,
        month: formValue.airDate.month!,
        year: formValue.airDate.year!
      },
      visibility: formValue.visibility
    });
    this.mediaService.addTVEpisode(mediaId, addTVEpisodeDto).pipe(takeUntil(this.destroyService)).subscribe({
      next: (episode) => this.dialogRef.close(episode),
      error: () => {
        this.isCreatingEpisode = false;
        this.ref.markForCheck();
      }
    });
  }

  onCreateEpisodeFormCancel(): void {
    this.dialogRef.close();
  }

}
