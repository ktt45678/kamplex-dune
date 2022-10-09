import { FormGroup } from '@angular/forms';
import { isEqual } from 'lodash-es';
import { tap, takeWhile } from 'rxjs';

export function detectFormChange(form: FormGroup, initValue: any, setFalse: () => void, setTrue: () => void) {
  let completed = false;
  setFalse();
  return form.valueChanges.pipe(
    tap(() => {
      if (!isEqual(form.value, initValue)) {
        setTrue();
        completed = true;
      }
    }),
    takeWhile(() => !completed)
  );
}
