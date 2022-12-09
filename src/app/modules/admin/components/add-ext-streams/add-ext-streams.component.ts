import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { ExtMediaEpisode, ExtMediaInfo, ExtMediaSuggestions } from '../../../../core/models';
import { MediaService } from '../../../../core/services';
import { ExtMediaProvider } from '../../../../core/enums';
import { trackId, trackLabel } from '../../../../core/utils';
import { ExtStreamSelected } from '../../../../core/interfaces/events';

interface FindExtMediaForm {
  query: FormControl<string>;
}

@Component({
  selector: 'app-add-ext-streams',
  templateUrl: './add-ext-streams.component.html',
  styleUrls: ['./add-ext-streams.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddExtStreamsComponent implements OnInit {
  @Output() onSelect = new EventEmitter<ExtStreamSelected>();
  findExtMediaForm: FormGroup<FindExtMediaForm>;
  extMediaResults?: ExtMediaSuggestions[];
  selectedMedia: { [key: string]: ExtMediaInfo } = {};
  steps: { [key: string]: number } = {};
  loadingMediaInfoObj: { [key: string]: boolean } = {};
  isUpdatingStreamObj: { [key: string]: boolean } = {};
  selectedStreamIdObj: { [key: string]: string } = {};
  loadingMediaList: boolean = false;
  trackId = trackId;
  trackLabel = trackLabel;

  constructor(private ref: ChangeDetectorRef, private mediaService: MediaService) {
    this.findExtMediaForm = new FormGroup<FindExtMediaForm>({
      query: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(2)] })
    }, { updateOn: 'change' });
  }

  ngOnInit(): void {
  }

  onFindExtMediaFormSubmit(): void {
    if (this.findExtMediaForm.invalid) return;
    this.loadingMediaList = true;
    const formValue = this.findExtMediaForm.getRawValue();
    this.mediaService.findExtMediaSuggestions(formValue.query).subscribe({
      next: suggestions => {
        this.extMediaResults = suggestions;
        suggestions.forEach(provider => {
          this.steps[provider.value] = 1;
        });
      }
    }).add(() => {
      this.loadingMediaList = false;
      this.ref.markForCheck();
    });
  }

  loadMediaInfo(index: number, childIndex: number): void {
    if (!this.extMediaResults) return;
    const provider = this.extMediaResults[index];
    const item = provider.items[childIndex];
    // Skip loading already loaded media
    if (item.id === this.selectedMedia[provider.value]?.id) {
      this.changeStep(provider.value, 2);
      return;
    }
    this.loadingMediaInfoObj[provider.value] = true;
    this.ref.markForCheck();
    const assignMedia = (media: ExtMediaInfo) => {
      this.selectedMedia[provider.value] = media;
      this.steps[provider.value] = 2;
    };
    const finalizer = () => {
      this.loadingMediaInfoObj[provider.value] = false;
      this.ref.markForCheck();
    };
    switch (provider.value) {
      case ExtMediaProvider.FLIX_HQ:
        this.mediaService.findFlixHQInfo(item.id).subscribe(assignMedia).add(finalizer);
        break;
      case ExtMediaProvider.ZORO:
        this.mediaService.findZoroInfo(item.id).subscribe(assignMedia).add(finalizer);
        break;
      case ExtMediaProvider.GOGOANIME:
        this.mediaService.findGogoanimeInfo(item.id).subscribe(assignMedia).add(finalizer);
        break;
    }
  }

  changeStep(provider: string, value: number) {
    this.steps[provider] = value;
    this.ref.markForCheck();
  }

  selectStream(providerValue: string, media: ExtMediaInfo, episode: ExtMediaEpisode): void {
    this.isUpdatingStreamObj[providerValue] = true;
    this.ref.markForCheck();
    const onComplete = () => {
      this.isUpdatingStreamObj[providerValue] = false;
      this.ref.markForCheck();
    };
    const onNext = () => {
      this.steps[providerValue] = 3;
      this.selectedStreamIdObj[providerValue] = episode.id;
      onComplete();
    };
    const onError = () => {
      onComplete();
    };
    switch (providerValue) {
      case ExtMediaProvider.FLIX_HQ:
        this.onSelect.emit({ streams: { flixHQId: `${episode.id}#${media.id}` }, next: onNext, error: onError });
        break;
      case ExtMediaProvider.ZORO:
        this.onSelect.emit({ streams: { zoroId: episode.id }, next: onNext, error: onError });
        break;
      case ExtMediaProvider.GOGOANIME:
        this.onSelect.emit({ streams: { gogoanimeId: episode.id }, next: onNext, error: onError });
        break;
    }
  }

  clearAll(): void {
    this.selectedMedia = {};
    this.extMediaResults = undefined;
    this.steps = {};
    this.loadingMediaInfoObj = {};
    this.isUpdatingStreamObj = {};
    this.ref.markForCheck();
  }
}
