import { ErrorHandler, Injectable, /*NgZone*/ } from '@angular/core';
//import { MessageService } from 'primeng/api';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {

  constructor(/*private messageService: MessageService, private zone: NgZone*/) { }

  handleError(error: Error) {
    console.error(error);
    /*
    this.zone.run(() => this.messageService.add({
      key: 'app-toast', severity: 'error', summary: 'Error', detail: 'An unexpected error occurred', life: 10000
    }));
    */
  }
}
