import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { TranslocoService } from '@ngneat/transloco';
import { DialogService } from 'primeng/dynamicdialog';
import { first } from 'rxjs';

import { AddToPlaylistComponent } from '../../../../shared/dialogs/add-to-playlist';
import { CursorPageHistoryDto } from '../../../../core/dto/history';
import { DropdownOptionDto } from '../../../../core/dto/media';
import { CursorPaginated, Genre, HistoryGroup, HistoryGroupable, Media } from '../../../../core/models';
import { GenresService, HistoryService, ItemDataService, MediaService } from '../../../../core/services';
import { trackHistoryGroup, track_Id } from '../../../../core/utils';

interface FilterHistoryForm {
  startDate: FormControl<Date | null>;
  endDate: FormControl<Date | null>;
  media: FormControl<Media[] | null>;
  mediaType: FormControl<string | null>;
  mediaOriginalLanguage: FormControl<string | null>;
  mediaYear: FormControl<number | null>;
  mediaGenres: FormControl<Genre[] | null>;
}

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
  providers: [HistoryService, ItemDataService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HistoryComponent implements OnInit, OnDestroy {
  filterHistoryForm: FormGroup<FilterHistoryForm>;
  paginateHistoryOptions: Omit<CursorPageHistoryDto, 'pageToken' | 'limit'>;
  showFilterForm: boolean = true;
  loadingHistoryList: boolean = false;
  loadingMoreHistoryList: boolean = false;
  historyLimit: number = 30;
  historyList?: CursorPaginated<HistoryGroupable>;
  historyGroupList?: CursorPaginated<HistoryGroup>;
  mediaSuggestions: Media[] = [];
  genreSuggestions: Genre[] = [];
  skeletonArray: Array<any>;
  yearOptions: DropdownOptionDto[] = [];
  typeOptions: DropdownOptionDto[] = [];
  genreOptions: DropdownOptionDto[] = [];
  languages: DropdownOptionDto[] = [];
  maxCalendarDate: Date;
  listViewMode: 1 | 2 = 1;
  track_Id = track_Id;
  trackHistoryGroup = trackHistoryGroup;

  constructor(private ref: ChangeDetectorRef, private renderer: Renderer2, private translocoService: TranslocoService,
    private dialogService: DialogService, private historyService: HistoryService, private genresService: GenresService,
    private mediaService: MediaService, private itemDataService: ItemDataService,) {
    this.skeletonArray = new Array(this.historyLimit);
    this.maxCalendarDate = new Date();
    this.filterHistoryForm = new FormGroup<FilterHistoryForm>({
      startDate: new FormControl(),
      endDate: new FormControl(),
      media: new FormControl(),
      mediaType: new FormControl(),
      mediaOriginalLanguage: new FormControl(),
      mediaYear: new FormControl(),
      mediaGenres: new FormControl()
    });
    this.paginateHistoryOptions = {};
  }

  ngOnInit(): void {
    this.loadHistoryList();
    this.yearOptions = this.itemDataService.createYearList();
    this.itemDataService.createLanguageList().subscribe({
      next: languages => this.languages = languages
    });
    this.translocoService.selectTranslation('media').pipe(first()).subscribe(t => {
      this.typeOptions = [
        { value: 'movie', label: t['mediaTypes.movie'] },
        { value: 'tv', label: t['mediaTypes.tvShow'] }
      ];
    });
  }

  loadHistoryList(resetList?: boolean, pageToken?: string): void {
    if (resetList)
      this.loadingHistoryList = true;
    else
      this.loadingMoreHistoryList = true;
    this.historyService.findPage({ pageToken, limit: this.historyLimit, ...this.paginateHistoryOptions }).subscribe(newGroupList => {
      this.appendHistoryList(newGroupList);
      this.appendHistoryGroupList(newGroupList);
    }).add(() => {
      if (resetList)
        this.loadingHistoryList = false;
      else
        this.loadingMoreHistoryList = false;
      this.ref.markForCheck();
    });
  }

  appendHistoryList(newList: CursorPaginated<HistoryGroupable>, resetList?: boolean): void {
    if (!this.historyList || resetList) {
      this.historyList = {
        hasNextPage: newList.hasNextPage,
        nextPageToken: newList.nextPageToken,
        prevPageToken: newList.prevPageToken,
        totalResults: newList.totalResults,
        results: [...newList.results]
      };
      return;
    }
    this.historyList = {
      hasNextPage: newList.hasNextPage,
      nextPageToken: newList.nextPageToken,
      prevPageToken: newList.prevPageToken,
      totalResults: newList.totalResults,
      results: [...this.historyList.results, ...newList.results]
    };
  }

  appendHistoryGroupList(newList: CursorPaginated<HistoryGroupable>, resetList?: boolean): void {
    const groupList = newList.results.reduce<HistoryGroup[]>((r, a) => {
      let index = r.findIndex(g => g.groupByDate === a.groupByDate);
      if (index === -1)
        index = r.push({ groupByDate: a.groupByDate, historyList: [] }) - 1;
      r[index].historyList.push(a);
      return r;
    }, []);
    if (!this.historyGroupList || resetList) {
      this.historyGroupList = {
        hasNextPage: newList.hasNextPage,
        nextPageToken: newList.nextPageToken,
        prevPageToken: newList.prevPageToken,
        totalResults: newList.totalResults,
        results: [...groupList]
      };
      return;
    }
    if (this.historyGroupList.nextPageToken === newList.nextPageToken
      && this.historyGroupList.prevPageToken === newList.prevPageToken)
      return;
    this.historyGroupList = {
      hasNextPage: newList.hasNextPage,
      nextPageToken: newList.nextPageToken,
      prevPageToken: newList.prevPageToken,
      totalResults: newList.totalResults,
      results: [...this.historyGroupList.results]
    };
    groupList.forEach(result => {
      const findObj = this.historyGroupList!.results.find(r => r.groupByDate === result.groupByDate);
      if (!findObj)
        this.historyGroupList!.results.push(result)
      else
        findObj.historyList.push(...result.historyList);
    });
  }

  onScroll(): void {
    if (!this.historyList || !this.historyList.hasNextPage) return;
    this.loadHistoryList(false, this.historyList.nextPageToken);
  }

  loadGenreSuggestions(search: string): void {
    if (search.length > 250)
      return;
    this.genresService.findPage({ search, limit: 10 }).subscribe({
      next: data => this.genreSuggestions = data.results
    }).add(() => this.ref.markForCheck());
  }

  loadMediaSuggestions(search: string): void {
    if (search.length < 2 || search.length > 250)
      return;
    this.mediaService.findPage({ search, limit: 10 }).subscribe({
      next: data => this.mediaSuggestions = data.results
    }).add(() => this.ref.markForCheck());
  }

  onFilterHistoryFormSubmit(): void {
    if (this.filterHistoryForm.invalid) return;
    const formValue = this.filterHistoryForm.getRawValue();
    let mediaIds = undefined;
    let mediaGenres = undefined;
    let startDate = undefined;
    let endDate = undefined;
    if (formValue.media)
      mediaIds = formValue.media.map(m => m._id);
    if (formValue.mediaGenres)
      mediaGenres = formValue.mediaGenres.map(g => g._id);
    if (formValue.startDate) {
      formValue.startDate.setHours(0, 0, 0, 0);
      startDate = formValue.startDate.toJSON();
    }
    if (formValue.endDate) {
      formValue.endDate.setHours(23, 59, 59, 999);
      endDate = formValue.endDate.toJSON();
    }
    this.paginateHistoryOptions = {
      startDate,
      endDate,
      mediaIds,
      mediaGenres,
      mediaType: formValue.mediaType,
      mediaOriginalLanguage: formValue.mediaOriginalLanguage,
      mediaYear: formValue.mediaYear
    };
    this.historyList = undefined;
    this.historyGroupList = undefined;
    this.loadHistoryList(true);
  }

  onHistoryMenuClick(button: HTMLButtonElement, opened: boolean): void {
    this.renderer[opened ? 'removeClass' : 'addClass'](button, 'tw-invisible');
    this.renderer[opened ? 'addClass' : 'removeClass'](button, 'tw-visible');
  }

  showAddToPlaylistDialog(media: Media): void {
    this.dialogService.open(AddToPlaylistComponent, {
      data: { ...media },
      header: this.translocoService.translate('media.playlists.addToPlaylists'),
      width: '320px',
      modal: true,
      dismissableMask: true,
      styleClass: 'p-dialog-header-sm'
    });
  }

  pauseAndUnpauseHistory(history: HistoryGroupable, event: Event): void {
    const element = event.target instanceof HTMLButtonElement ? event.target : <HTMLButtonElement>(<HTMLSpanElement>event.target).parentElement;
    this.renderer.setProperty(element, 'disabled', true);
    this.historyService.update(history._id, { paused: !history.paused }).subscribe(updatedHistory => {
      history.paused = updatedHistory.paused;
      this.ref.markForCheck();
    }).add(() => {
      this.renderer.setProperty(element, 'disabled', false);
    });
  }

  deleteHistory(history: HistoryGroupable): void {
    this.historyService.remove(history._id).subscribe(() => {
      if (this.historyGroupList) {
        const historyGroup = this.historyGroupList.results.find(g => g.groupByDate === history.groupByDate);
        if (historyGroup) {
          const historyIndex = historyGroup.historyList.findIndex(h => h._id === history._id);
          if (historyIndex > -1)
            historyGroup.historyList.splice(historyIndex, 1);
        }
      }
      if (this.historyList) {
        const historyIndex = this.historyList.results.findIndex(h => h._id === history._id);
        this.historyList.results.splice(historyIndex, 1);
      }
      this.ref.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.dialogService.dialogComponentRefMap.forEach(dialogRef => {
      dialogRef.instance.close();
    });
  }
}
