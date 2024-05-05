import { ChangeDetectionStrategy, Component, computed, effect, ElementRef, signal, untracked, viewChild, viewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, fromEvent, takeUntil } from 'rxjs';

import { DestroyService, MediaService } from '../../../core/services';
import { Media } from '../../../core/models';
import { MediaType } from '../../../core/enums';

@Component({
  selector: 'app-search-overlay',
  templateUrl: './search-overlay.component.html',
  styleUrl: './search-overlay.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DestroyService]
})
export class SearchOverlayComponent {
  MediaType = MediaType;

  searchResults = signal<Media[] | null>(null);
  selectedIndex = signal<number>(-1);
  searchResultLength = computed(() => this.searchResults()?.length || 0);

  inputSearch = viewChild<ElementRef<HTMLInputElement>>('inputSearch');
  searchMediaResults = viewChildren<ElementRef<HTMLElement>>('searchMediaResult');

  constructor(private router: Router, private destroyService: DestroyService, private mediaService: MediaService) {
    effect(() => {
      const inputSearch = this.inputSearch();
      if (!inputSearch) return;
      inputSearch.nativeElement.focus();
      this.listenInputSearch(inputSearch);
    });
  }

  listenInputSearch(inputSearch: ElementRef<HTMLInputElement>): void {
    // Input event
    fromEvent<Event>(inputSearch.nativeElement, 'input').pipe(
      debounceTime(250),
      distinctUntilChanged(),
      takeUntil(this.destroyService)
    ).subscribe((event) => this.onSearchInput(event));
    // Any keydown event
    fromEvent<KeyboardEvent>(inputSearch.nativeElement, 'keydown').pipe(
      takeUntil(this.destroyService)
    ).subscribe((event) => this.onSearchInputKeydown(event));
    // Any keyup event
    fromEvent<KeyboardEvent>(inputSearch.nativeElement, 'keyup').pipe(
      takeUntil(this.destroyService)
    ).subscribe((event) => this.onSearchInputKeyup(event));
  }

  onSearchInput(event: Event) {
    const targetInput = <HTMLInputElement>event.target;
    if (!targetInput.value) {
      this.searchResults.set(null);
      return;
    }
    this.searchMedia(targetInput.value);
  }

  onSearchInputKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowDown':
        event.preventDefault();
        break;
    }
  }

  onSearchInputKeyup(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowUp':
        this.selectedIndex.update((value) => value - 1 < 0 ? this.searchResultLength() - 1 : value - 1);
        this.scrollToSelectedIndex();
        break;
      case 'ArrowDown':
        this.selectedIndex.update((value) => value + 1 >= this.searchResultLength() ? 0 : value + 1);
        this.scrollToSelectedIndex();
        break;
      case 'Enter':
        const selectedMedia = this.searchResults()?.[this.selectedIndex()];
        if (selectedMedia) {
          this.router.navigate(['/details', selectedMedia._id]);
        } else {
          const searchValue = this.inputSearch()?.nativeElement.value;
          this.router.navigate(['/search'], { queryParams: { search: searchValue || undefined } });
        }
        break;
    }
  }

  scrollToSelectedIndex() {
    const searchResultEl = this.searchMediaResults()[this.selectedIndex()];
    if (!searchResultEl) return;
    searchResultEl.nativeElement.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  searchMedia(query: string): void {
    this.mediaService.findPage({
      page: 1,
      limit: 10,
      search: query
    }).subscribe(paginated => {
      this.searchResults.set(paginated.results);
    });
  }
}
