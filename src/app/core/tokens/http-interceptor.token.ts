import { HttpContextToken } from '@angular/common/http';

export type CanInterceptValues = 'http-error' | 'base-url';

export const RETRY_COUNT = new HttpContextToken<number>(() => 5);
export const CAN_INTERCEPT = new HttpContextToken<CanInterceptValues[]>(() => ['base-url', 'http-error']);
