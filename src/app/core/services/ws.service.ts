import { Inject, Injectable, OnDestroy, Optional } from '@angular/core';
import { io, ManagerOptions, Socket, SocketOptions } from 'socket.io-client';
import { fromEvent, Observable, share } from 'rxjs';

import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

@Injectable()
export class WsService implements OnDestroy {
  public socket: Socket;

  constructor(private authService: AuthService, @Inject('wsNamespace') @Optional() private wsNamespace?: string,
    @Inject('wsAuth') @Optional() private wsAuth: boolean = false) {
    const url = this.wsNamespace ? `${environment.socketUrl}/${this.wsNamespace}` : environment.socketUrl;
    const options: Partial<ManagerOptions & SocketOptions> = { transports: ['websocket'] };
    this.wsAuth && (options.auth = { token: this.authService.accessTokenValue });
    this.socket = io(url, options);
  }

  fromEvent<T>(eventName: string) {
    return fromEvent<T>(this.socket, eventName).pipe(share());
  }

  fromEventOnce<T>(eventName: string) {
    return new Observable(observer => {
      this.socket.once(eventName, (data: T) => {
        observer.next(data);
        observer.complete();
      });
    });
  }

  ngOnDestroy(): void {
    this.socket.off();
    this.socket.disconnect();
  }
}
