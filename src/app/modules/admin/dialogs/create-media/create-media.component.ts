import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslocoService } from '@ngneat/transloco';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { first } from 'rxjs';

import { CreateMediaDto, DropdownOptionDto } from '../../../../core/dto/media';
import { MediaType } from '../../../../core/enums';
import { Genre, Producer } from '../../../../core/models';
import { GenresService, ItemDataService, MediaService, ProducersService } from '../../../../core/services';
import { shortDate } from '../../../../core/validators';

@Component({
  selector: 'app-create-media',
  templateUrl: './create-media.component.html',
  styleUrls: ['./create-media.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MediaService, GenresService, ProducersService, ItemDataService]
})
export class CreateMediaComponent implements OnInit {
  MediaType = MediaType;
  isCreatingMedia: boolean = false;
  createMediaForm: FormGroup;
  days: DropdownOptionDto[];
  months: DropdownOptionDto[];
  years: DropdownOptionDto[];
  languages: DropdownOptionDto[];
  genreSuggestions: Genre[];
  producerSuggestions: Producer[];

  constructor(private ref: ChangeDetectorRef, private dialogRef: DynamicDialogRef,
    private config: DynamicDialogConfig, private mediaService: MediaService, private genresService: GenresService,
    private producersService: ProducersService, private itemDataService: ItemDataService,
    private translocoService: TranslocoService) {
    const type = this.config.data['type'] || MediaType.MOVIE;
    this.createMediaForm = new FormGroup({
      type: new FormControl(type),
      title: new FormControl('', [Validators.required, Validators.maxLength(500)]),
      originalTitle: new FormControl(null, [Validators.maxLength(500)]),
      overview: new FormControl(null, [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]),
      originalLanguage: new FormControl(null),
      genres: new FormControl(null),
      producers: new FormControl(null),
      runtime: new FormControl(null, [Validators.required]),
      adult: new FormControl(false, [Validators.required]),
      releaseDateDay: new FormControl(null),
      releaseDateMonth: new FormControl(null),
      releaseDateYear: new FormControl(null),
      lastAirDateDay: new FormControl(null),
      lastAirDateMonth: new FormControl(null),
      lastAirDateYear: new FormControl(null),
      visibility: new FormControl(1, [Validators.required]),
      status: new FormControl(type === MediaType.MOVIE ? 'released' : 'aired', [Validators.required])
    }, {
      validators: [
        shortDate('releaseDateDay', 'releaseDateMonth', 'releaseDateYear', true),
        shortDate('lastAirDateDay', 'lastAirDateMonth', 'lastAirDateYear', false)
      ]
    });
    this.days = this.itemDataService.createDateList();
    this.months = this.itemDataService.createMonthList();
    this.years = this.itemDataService.createYearList();
    this.languages = [];
    this.genreSuggestions = [];
    this.producerSuggestions = [];
  }

  ngOnInit(): void {
    this.loadGenreSuggestions();
    this.loadProducerSuggestions();
    this.itemDataService.createLanguageList().pipe(first()).subscribe(languages => {
      this.languages = languages
    });
  }

  loadGenreSuggestions(search?: string): void {
    this.genresService.findPage({ limit: 10, search }).subscribe({
      next: genres => {
        const genreSuggestions = genres.results;
        const hasMatch = genres.results.find(g => g.name === search);
        if (search && !hasMatch) {
          genreSuggestions.push({
            _id: `create:${search}`,
            name: this.translocoService.translate('admin.createMedia.createGenreByName', { name: search })
          });
        }
        this.genreSuggestions = genreSuggestions;
      }
    }).add(() => this.ref.markForCheck());
  }

  loadProducerSuggestions(search?: string): void {
    this.producersService.findPage({ limit: 10, search }).subscribe({
      next: producers => {
        const producerSuggestions = producers.results;
        const hasMatch = producers.results.find(p => p.name === search);
        if (search && !hasMatch) {
          producerSuggestions.push({
            _id: `create:${search}`,
            name: this.translocoService.translate('admin.createMedia.createProducerByName', { name: search })
          });
        }
        this.producerSuggestions = producerSuggestions;
      },
    }).add(() => this.ref.markForCheck());
  }

  onCreateMediaFormSubmit(): void {
    if (this.createMediaForm.invalid) return;
    const genreIds = this.createMediaForm.value['genres'].map((g: Genre) => g._id);
    const producerIds = this.createMediaForm.value['producers'].map((p: Producer) => p._id);
    this.isCreatingMedia = true;
    const createMediaDto: CreateMediaDto = ({
      type: this.createMediaForm.value['type'],
      title: this.createMediaForm.value['title'],
      originalTitle: this.createMediaForm.value['originalTitle'],
      overview: this.createMediaForm.value['overview'],
      genres: genreIds,
      originalLanguage: this.createMediaForm.value['originalLanguage'],
      producers: producerIds,
      runtime: this.createMediaForm.value['runtime'],
      adult: this.createMediaForm.value['adult'],
      releaseDate: {
        day: this.createMediaForm.value['releaseDateDay'],
        month: this.createMediaForm.value['releaseDateMonth'],
        year: this.createMediaForm.value['releaseDateYear']
      },
      visibility: this.createMediaForm.value['visibility'],
      status: this.createMediaForm.value['status']
    });
    if (createMediaDto.type === MediaType.TV) {
      createMediaDto.lastAirDate = {
        day: this.createMediaForm.value['lastAirDateDay'],
        month: this.createMediaForm.value['lastAirDateMonth'],
        year: this.createMediaForm.value['lastAirDateYear']
      }
    }
    this.mediaService.create(createMediaDto).subscribe({
      next: () => this.dialogRef.close(true),
      error: () => {
        this.isCreatingMedia = false;
        this.ref.markForCheck();
      }
    });
  }

  onCreateMediaFormCancel(): void {
    this.dialogRef.close(false);
  }

}