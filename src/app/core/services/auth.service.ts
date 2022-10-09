import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import jwt_decode from 'jwt-decode';

import { UserDetails, JWTWithPayload } from '../models';
import { ConfirmEmailDto, PasswordRecoveryDto, ResetPasswordDto, SignInDto, SignUpDto } from '../dto/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private refreshTokenTimeout?: any;
  private _accessToken: string | null;
  private currentUserSubject: BehaviorSubject<UserDetails | null>;
  public currentUser$: Observable<UserDetails | null>;

  constructor(private http: HttpClient) {
    this._accessToken = null;
    this.currentUserSubject = new BehaviorSubject<UserDetails | null>(null);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  public get accessTokenValue() {
    return this._accessToken;
  }

  public get currentUser(): UserDetails | null {
    return this.currentUserSubject.value;
  }

  public set currentUser(user: UserDetails | null) {
    this.currentUserSubject.next(user);
  }

  signIn(body: SignInDto) {
    return this.http.post<JWTWithPayload>('auth/sign-in', body, { withCredentials: true }).pipe(tap(data => {
      this._accessToken = data.accessToken;
      this.currentUserSubject.next(data.payload);
      this.startRefreshTokenTimer();
    }));
  }

  signUp(body: SignUpDto) {
    return this.http.post<JWTWithPayload>('auth/sign-up', body, { withCredentials: true }).pipe(tap(data => {
      this._accessToken = data.accessToken;
      this.currentUserSubject.next(data.payload);
      this.startRefreshTokenTimer();
    }));
  }

  sendConfirmEmail(body: any = {}) {
    return this.http.post('auth/send-confirmation-email', body);
  }

  confirmEmail(body: ConfirmEmailDto) {
    return this.http.post<void>('auth/confirm-email', body, { headers: { 'x-ng-intercept': 'base-url' } });
  }

  sendRecoveryEmail(body: PasswordRecoveryDto) {
    return this.http.post('auth/password-recovery', body);
  }

  resetPassword(body: ResetPasswordDto) {
    return this.http.post('auth/reset-password', body);
  }

  refreshToken() {
    return this.http.post<JWTWithPayload>('auth/refresh-token', {}, { withCredentials: true }).pipe(tap(data => {
      this._accessToken = data.accessToken;
      this.currentUserSubject.next(data.payload);
      this.startRefreshTokenTimer();
    }));
  }

  signOut() {
    this.http.post('auth/revoke-token', {}, { withCredentials: true }).subscribe().add(() => {
      this.currentUserSubject.next(null);
      this._accessToken = null;
      this.stopRefreshTokenTimer();
    });
  }

  private startRefreshTokenTimer() {
    const accessToken = this.accessTokenValue;
    if (accessToken) {
      // Parse json object from base64 encoded jwt token
      const jwtToken = jwt_decode<any>(accessToken);
      // Set a timeout to refresh the token a minute before it expires
      const expires = new Date(jwtToken.exp * 1000);
      const timeout = expires.getTime() - Date.now() - (60 * 1000);
      this.refreshTokenTimeout = setTimeout(() => this.refreshToken().subscribe(), timeout);
    }
  }

  private stopRefreshTokenTimer() {
    this.refreshTokenTimeout && clearTimeout(this.refreshTokenTimeout);
  }
}
