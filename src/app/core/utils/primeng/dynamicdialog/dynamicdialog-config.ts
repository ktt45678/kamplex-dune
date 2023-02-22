import { DynamicDialogConfig as OriginalDynamicDialogConfig } from 'primeng/dynamicdialog';

export class DynamicDialogConfig<T = any> extends OriginalDynamicDialogConfig<T> {
  minimal?: string;
  closeOnNavigation?: boolean;
}
