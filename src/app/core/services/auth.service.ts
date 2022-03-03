import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import jwt_decode from 'jwt-decode';

import { UserDetails, JWTWithPayload } from '../models';
import { SignInDto, SignUpDto } from '../dto/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private refreshTokenTimeout?: any;
  private _accessToken: string | null;
  private _refreshToken: string | null;
  private currentUserSubject: BehaviorSubject<UserDetails | null>;
  public currentUser$: Observable<UserDetails | null>;

  constructor(private http: HttpClient) {
    this._accessToken = null;
    this._refreshToken = localStorage.getItem('refreshToken');
    this.currentUserSubject = new BehaviorSubject<UserDetails | null>(null);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  public get accessTokenValue() {
    return this._accessToken;
  }

  public get refreshTokenValue() {
    return this._refreshToken;
  }

  public get currentUser(): UserDetails | null {
    return this.currentUserSubject.value;
  }

  public set currentUser(user: UserDetails | null) {
    this.currentUserSubject.next(user);
  }

  signIn(body: SignInDto) {
    return this.http.post<JWTWithPayload>('auth/sign-in', body).pipe(tap(data => {
      this._accessToken = data.accessToken;
      this._refreshToken = data.refreshToken;
      this.currentUserSubject.next(data.payload);
      localStorage.setItem('refreshToken', data.refreshToken);
      this.startRefreshTokenTimer();
    }));
  }

  signUp(body: SignUpDto) {
    return this.http.post<JWTWithPayload>('auth/sign-up', body).pipe(tap(data => {
      this._accessToken = data.accessToken;
      this._refreshToken = data.refreshToken;
      this.currentUserSubject.next(data.payload);
      localStorage.setItem('refreshToken', data.refreshToken);
      this.startRefreshTokenTimer();
    }));
  }

  sendConfirmEmail(body: any = {}) {
    return this.http.post('auth/send-confirmation-email', body);
  }

  confirmEmail(body: any = {}) {
    return this.http.post('auth/confirm-email', body);
  }

  sendRecoveryEmail(body: any = {}) {
    return this.http.post('auth/send-recovery-email', body);
  }

  resetPassword(body: any = {}) {
    return this.http.post('auth/reset-password', body);
  }

  refreshToken() {
    return this.http.post<JWTWithPayload>('auth/refresh-token', { refreshToken: this.refreshTokenValue }).pipe(tap(data => {
      this._accessToken = data.accessToken;
      this._refreshToken = data.refreshToken;
      this.currentUserSubject.next(data.payload);
      localStorage.setItem('refreshToken', data.refreshToken);
      this.startRefreshTokenTimer();
    }));
  }

  signOut() {
    this.http.post('auth/revoke-token', { refreshToken: this.refreshTokenValue }).subscribe().add(() => {
      this.currentUserSubject.next(null);
      this._accessToken = null;
      localStorage.removeItem('refreshToken');
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
