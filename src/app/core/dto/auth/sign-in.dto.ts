export interface SignInDto {
  email: string;
  password: string;
  captcha?: string | null;
}
