import { FormControl } from '@angular/forms';

export interface ShortDateForm {
  day: FormControl<number | null>;
  month: FormControl<number | null>;
  year: FormControl<number | null>;
}
