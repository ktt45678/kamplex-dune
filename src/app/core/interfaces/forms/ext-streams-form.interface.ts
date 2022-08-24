import { FormControl } from '@angular/forms';

export interface ExtStreamsForm {
  imdb: FormControl<string | null>;
  tmdb: FormControl<number | null>;
  aniList: FormControl<number | null>;
  mal: FormControl<number | null>;
}
