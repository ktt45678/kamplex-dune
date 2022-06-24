import { Inject, Injectable, Optional } from '@angular/core';
import { io, ManagerOptions, Socket, SocketOptions } from 'socket.io-client';
import { fromEvent, Observable, share } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';
import { WS_AUTH, WS_NAMESPACE } from './ws.token';

@Injectable()
export class WsService {
  public socket!: Socket;
  private url: string;
  private options: Partial<ManagerOptions & SocketOptions>;

  constructor(private authService: AuthService, @Inject(WS_NAMESPACE) @Optional() private wsNamespace?: string,
    @Inject(WS_AUTH) @Optional() private wsAuth?: boolean) {
    this.url = this.wsNamespace ? `${environment.socketUrl}/${this.wsNamespace}` : environment.socketUrl;
    this.options = { transports: ['websocket'] };
    this.wsAuth && (this.options.auth = { token: this.authService.accessTokenValue });
  }

  init(): void {
    this.socket = io(this.url, this.options);
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

  joinRoom(room: string) {
    this.socket.emit('room:join', room);
  }

  leaveRoom(room: string) {
    this.socket.emit('room:leave', room);
  }

  destroy(): void {
    this.socket.off();
    this.socket.disconnect();
  }
}
