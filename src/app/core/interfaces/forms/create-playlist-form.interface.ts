import { FormControl } from '@angular/forms';

export interface CreatePlaylistForm {
  name: FormControl<string>;
  visibility: FormControl<number>;
}
