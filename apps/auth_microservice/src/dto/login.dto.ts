export class LoginDto {
  constructor(email: string, password: string) {
    this.email = email;
    this.password = password;
  }
  readonly email: string;
  readonly password: string;
}
