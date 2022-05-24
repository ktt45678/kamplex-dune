import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { takeUntil } from 'rxjs';
import { DateTime } from 'luxon';

import { AddTVEpisodeDto, DropdownOptionDto } from '../../../../core/dto/media';
import { MediaDetails } from '../../../../core/models';
import { DestroyService, ItemDataService, MediaService } from '../../../../core/services';
import { shortDate } from '../../../../core/validators';

@Component({
  selector: 'app-create-episode',
  templateUrl: './create-episode.component.html',
  styleUrls: ['./create-episode.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ItemDataService, DestroyService]
})
export class CreateEpisodeComponent implements OnInit {
  isCreatingEpisode: boolean = false;
  createEpisodeForm: FormGroup;
  days: DropdownOptionDto[];
  months: DropdownOptionDto[];
  years: DropdownOptionDto[];

  constructor(private ref: ChangeDetectorRef, private dialogRef: DynamicDialogRef, private config: DynamicDialogConfig,
    private mediaService: MediaService, private itemDataService: ItemDataService, private destroyService: DestroyService) {
    this.createEpisodeForm = new FormGroup({
      episodeNumber: new FormControl(null, [Validators.required, Validators.min(0), Validators.max(10000)]),
      name: new FormControl('', [Validators.maxLength(500)]),
      overview: new FormControl('', [Validators.minLength(10), Validators.maxLength(2000)]),
      runtime: new FormControl(null, [Validators.required, Validators.min(0), Validators.max(10000)]),
      airDateDay: new FormControl(null),
      airDateMonth: new FormControl(null),
      airDateYear: new FormControl(null),
      visibility: new FormControl(1, [Validators.required])
    }, {
      validators: shortDate('airDateDay', 'airDateMonth', 'airDateYear', true)
    });
    this.days = this.itemDataService.createDateList();
    this.months = this.itemDataService.createMonthList();
    this.years = this.itemDataService.createYearList();
    const media: MediaDetails = this.config.data;
    if (media.tv.episodes.length) {
      const lastEpisode = media.tv.episodes.reduce((prev, current) => (prev.episodeNumber > current.episodeNumber) ? prev : current);
      const lastEpisodeAirDate = DateTime.fromObject({ day: lastEpisode.airDate.day, month: lastEpisode.airDate.month, year: lastEpisode.airDate.year });
      const nextWeekDate = lastEpisodeAirDate.plus({ weeks: 1 });
      this.createEpisodeForm.patchValue({
        episodeNumber: lastEpisode.episodeNumber + 1,
        runtime: lastEpisode.runtime,
        airDateDay: nextWeekDate.day,
        airDateMonth: nextWeekDate.month,
        airDateYear: nextWeekDate.year
      });
    }
  }

  ngOnInit(): void {
  }

  onCreateEpisodeFormSubmit(): void {
    if (this.createEpisodeForm.invalid) return;
    const mediaId = this.config.data['_id'];
    this.isCreatingEpisode = true;
    const addTVEpisodeDto: AddTVEpisodeDto = ({
      episodeNumber: this.createEpisodeForm.value['episodeNumber'],
      name: this.createEpisodeForm.value['name'],
      overview: this.createEpisodeForm.value['overview'],
      runtime: this.createEpisodeForm.value['runtime'],
      airDate: {
        day: this.createEpisodeForm.value['airDateDay'],
        month: this.createEpisodeForm.value['airDateMonth'],
        year: this.createEpisodeForm.value['airDateYear']
      },
      visibility: this.createEpisodeForm.value['visibility']
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
