export interface ResetPasswordDto {
  id: string;
  recoveryCode: string;
  password: string;
}
