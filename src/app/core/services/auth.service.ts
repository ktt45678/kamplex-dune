import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import jwt_decode from 'jwt-decode';

import { UserDetails, JWTWithPayload } from '../models';
import { ISignIn, ISignUp } from '../interfaces/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private refreshTokenTimeout?: any;
  private currentUserSubject: BehaviorSubject<UserDetails | null>;
  public currentUser: Observable<UserDetails | null>;

  constructor(private http: HttpClient) {
    const user = this.accessTokenValue ? jwt_decode<UserDetails>(this.accessTokenValue) : null;
    this.currentUserSubject = new BehaviorSubject<UserDetails | null>(user);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get accessTokenValue() {
    return localStorage.getItem('accessToken');
  }

  public get refreshTokenValue() {
    return localStorage.getItem('refreshToken');
  }

  public get currentUserValue(): UserDetails | null {
    return this.currentUserSubject.value;
  }

  public set currentUserValue(user: UserDetails | null) {
    this.currentUserSubject.next(user);
  }

  signIn(body: ISignIn) {
    return this.http.post<JWTWithPayload>('auth/sign-in', body).pipe(tap(data => {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      this.currentUserSubject.next(data.payload);
      this.startRefreshTokenTimer();
    }));
  }

  signUp(body: ISignUp) {
    return this.http.post('auth/sign-up', body);
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
    return this.http.post<JWTWithPayload>('auth/refresh-token', { token: this.refreshTokenValue }).pipe(tap(data => {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      this.currentUserSubject.next(data.payload);
      this.startRefreshTokenTimer();
    }));
  }

  signOut() {
    this.http.post('auth/revoke-token', { token: this.refreshTokenValue }).pipe(tap(() => {
      this.currentUserSubject.next(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      this.stopRefreshTokenTimer();
    }));
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
