import '@ngneat/transloco';

declare module '@ngneat/transloco' {
  type TranslocoTranslateFn = (key: string, params?: HashMap) => any;
}
