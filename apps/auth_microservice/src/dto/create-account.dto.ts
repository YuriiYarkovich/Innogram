export class CreateAccountDto {
  constructor(
    email: string,
    password: string,
    username: string,
    displayName: string,
    birthday: string,
    bio: string,
  ) {
    this.email = email;
    this.password = password;
    this.username = username;
    this.displayName = displayName;
    this.birthday = birthday;
    this.bio = bio;
  }
  readonly email: string;
  readonly password: string;
  readonly username: string;
  readonly displayName: string;
  readonly birthday: string;
  readonly bio: string;
}
