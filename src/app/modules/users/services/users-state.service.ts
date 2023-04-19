import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { UserDetails } from '../../../core/models';

@Injectable()
export class UsersStateService {
  private userSubject: BehaviorSubject<UserDetails | null>;
  public user$: Observable<UserDetails | null>;

  constructor() {
    this.userSubject = new BehaviorSubject<UserDetails | null>(null);
    this.user$ = this.userSubject.asObservable();
  }

  public get user(): UserDetails | null {
    return this.userSubject.value;
  }

  public set user(user: UserDetails | null) {
    this.userSubject.next(user);
  }
}
