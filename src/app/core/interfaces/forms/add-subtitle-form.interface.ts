import { FormControl } from '@angular/forms';

export interface AddSubtitleForm {
  language: FormControl<string | null>;
  file: FormControl<File | null>;
}
