import { ErrorHandler, Injectable, NgZone } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { MessageService } from 'primeng/api';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {

  constructor(private messageService: MessageService, private zone: NgZone, private translocoService: TranslocoService) { }

  handleError(error: Error) {
    console.error(error);
    if (error.message.startsWith('appError:')) {
      const summary = this.translocoService.translate('errorMessagesHeader');
      const detail = this.translocoService.translate('errorMessages.' + error.message.substring(9));
      this.zone.run(() => this.messageService.add({
        key: 'app-toast', severity: 'error', summary, detail, life: 10000
      }));
    }
  }
}
