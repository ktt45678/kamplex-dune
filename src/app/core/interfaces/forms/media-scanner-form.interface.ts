import { FormControl } from '@angular/forms';

export interface MediaScannerForm {
  enabled: FormControl<boolean>;
  tvSeason?: FormControl<number | null>;
}
