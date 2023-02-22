import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';

import { Media, PlaylistToAdd } from '../../../core/models';
import { PlaylistsService } from '../../../core/services';
import { MediaVisibility } from '../../../core/enums';
import { CreatePlaylistForm } from '../../../core/interfaces/forms';
import { AltCheckbox } from '../../../core/utils/primeng';
import { debounceTime, distinctUntilChanged, fromEvent, Subscription } from 'rxjs';

@Component({
  selector: 'app-add-to-playlist',
  templateUrl: './add-to-playlist.component.html',
  styleUrls: ['./add-to-playlist.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PlaylistsService]
})
export class AddToPlaylistComponent implements OnInit, OnDestroy {
  // Listen to input search keyup event with viewchild setter
  @ViewChild('inputSearchPlaylists') set listenToInputSearch(input: ElementRef<HTMLInputElement>) {
    this.inputSearchSub?.unsubscribe();
    if (!input) return;
    this.inputSearchSub = fromEvent(input.nativeElement, 'keyup').pipe(debounceTime(200), distinctUntilChanged())
      .subscribe((event: Event) => {
        this.findAllToPlaylist((<HTMLInputElement>event.target).value);
      });
  };
  // Scroll to this form when rendered
  @ViewChild('createPlaylistFormRef') set scrollToPlaylistForm(form: ElementRef<HTMLFormElement>) {
    form?.nativeElement.scrollIntoView();
  };
  inputSearchSub?: Subscription;
  MediaVisibility = MediaVisibility;
  createPlaylistForm: FormGroup<CreatePlaylistForm>;
  loadingPlaylist: boolean = false;
  playlistsToAdd?: PlaylistToAdd[];
  showCreatePlaylistForm: boolean = false;

  constructor(private ref: ChangeDetectorRef, private config: DynamicDialogConfig<Media>, private playlistsService: PlaylistsService) {
    this.createPlaylistForm = new FormGroup<CreatePlaylistForm>({
      name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(100)] }),
      visibility: new FormControl(1, { nonNullable: true, validators: Validators.required })
    });
  }

  ngOnInit(): void {
    this.findAllToPlaylist();
  }

  findAllToPlaylist(search?: string) {
    this.loadingPlaylist = true;
    this.ref.markForCheck();
    if (!this.config.data) return;
    const mediaId = this.config.data._id;
    this.playlistsService.findAddToPlaylist({ mediaId, search }).subscribe(playlists => {
      this.playlistsToAdd = playlists;
    }).add(() => {
      this.loadingPlaylist = false;
      this.ref.markForCheck();
    });
  }

  addOrRemoveMedia(playlist: PlaylistToAdd, cbPlaylist: AltCheckbox) {
    cbPlaylist.disabled = true;
    cbPlaylist.cd.markForCheck();
    if (!playlist.hasMedia) {
      this.playlistsService.addToPlaylist(playlist._id, { mediaId: this.config.data!._id }).subscribe({
        next: () => playlist.hasMedia = true,
        error: () => cbPlaylist.model = cbPlaylist.value = false
      }).add(() => {
        cbPlaylist.disabled = false;
        cbPlaylist.cd.markForCheck();
      });
      return;
    }
    this.playlistsService.removePlaylistItem(playlist._id, { mediaId: this.config.data!._id }).subscribe({
      next: () => playlist.hasMedia = false,
      error: () => cbPlaylist.model = cbPlaylist.value = true
    }).add(() => {
      cbPlaylist.disabled = false;
      cbPlaylist.cd.markForCheck();
    });;
  }

  setShowCreatePlaylistForm(value: boolean) {
    this.showCreatePlaylistForm = value;
  }

  onCreatePlaylistFormSubmit() {
    if (this.createPlaylistForm.invalid) return;
    this.createPlaylistForm.disable({ emitEvent: false });
    const formValue = this.createPlaylistForm.getRawValue();
    this.playlistsService.create({
      name: formValue.name,
      visibility: formValue.visibility,
      mediaId: this.config.data!._id
    }).subscribe({
      next: playlist => {
        this.playlistsToAdd!.unshift({
          _id: playlist._id,
          name: playlist.name,
          itemCount: playlist.itemCount,
          visibility: playlist.visibility,
          createdAt: playlist.createdAt,
          hasMedia: true
        });
        // Keep lenght at 10
        if (this.playlistsToAdd!.length > 10)
          this.playlistsToAdd = this.playlistsToAdd!.slice(0, 10);
        this.createPlaylistForm.controls.name.reset();
      }
    }).add(() => {
      this.createPlaylistForm.enable({ emitEvent: false });
    });
  }

  ngOnDestroy(): void {
    this.inputSearchSub?.unsubscribe();
  }
}
