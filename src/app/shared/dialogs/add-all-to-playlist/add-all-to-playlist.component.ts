import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { debounceTime, distinctUntilChanged, fromEvent, Subscription } from 'rxjs';

import { MediaVisibility } from '../../../core/enums';
import { Playlist, PlaylistToAdd } from '../../../core/models';
import { PlaylistsService } from '../../../core/services';

interface AddAllItemsForm {
  playlistId: FormControl<string | null>;
  skipAlreadyAdded: FormControl<boolean>;
}

@Component({
  selector: 'app-add-all-to-playlist',
  templateUrl: './add-all-to-playlist.component.html',
  styleUrls: ['./add-all-to-playlist.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PlaylistsService]
})
export class AddAllToPlaylistComponent implements OnInit, OnDestroy {
  // Listen to input search keyup event with viewchild setter
  @ViewChild('inputSearchPlaylists') set listenToInputSearch(input: ElementRef<HTMLInputElement>) {
    this.inputSearchSub?.unsubscribe();
    if (!input) return;
    this.inputSearchSub = fromEvent(input.nativeElement, 'keyup').pipe(debounceTime(200), distinctUntilChanged())
      .subscribe((event: Event) => {
        this.findAllToPlaylist((<HTMLInputElement>event.target).value);
      });
  };
  inputSearchSub?: Subscription;
  MediaVisibility = MediaVisibility;
  addAllItemsForm: FormGroup<AddAllItemsForm>;
  loadingPlaylist: boolean = false;
  playlistsToAdd?: PlaylistToAdd[];
  addingItems: boolean = false;

  constructor(private ref: ChangeDetectorRef, private dialogRef: DynamicDialogRef, private config: DynamicDialogConfig<Playlist>,
    private playlistsService: PlaylistsService) {
    this.addAllItemsForm = new FormGroup<AddAllItemsForm>({
      playlistId: new FormControl(null, { nonNullable: true, validators: Validators.required }),
      skipAlreadyAdded: new FormControl(false, { nonNullable: true, validators: Validators.required })
    });
  }

  ngOnInit(): void {
    this.findAllToPlaylist();
  }

  findAllToPlaylist(search?: string) {
    this.loadingPlaylist = true;
    this.ref.markForCheck();
    this.playlistsService.findAddToPlaylist({ search }).subscribe(playlists => {
      this.playlistsToAdd = playlists;
    }).add(() => {
      this.loadingPlaylist = false;
      this.ref.markForCheck();
    });
  }

  onAddAllItemsFormSubmit() {
    if (this.addAllItemsForm.invalid) return;
    this.addAllItemsForm.disable({ emitEvent: false });
    const formValue = this.addAllItemsForm.getRawValue();
    this.playlistsService.addAllToPlaylist(formValue.playlistId!, {
      playlistId: this.config.data!._id,
      skipAlreadyAdded: formValue.skipAlreadyAdded
    }).subscribe({
      next: () => {
        this.dialogRef.close();
      },
      error: () => {
        this.addAllItemsForm.enable({ emitEvent: false });
      }
    });
  }

  ngOnDestroy(): void {
    this.inputSearchSub?.unsubscribe();
  }
}
