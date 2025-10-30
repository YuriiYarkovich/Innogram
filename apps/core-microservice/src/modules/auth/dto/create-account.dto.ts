import { IsDate, IsEmail, IsString, Length } from 'class-validator';

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
  @IsEmail()
  readonly email: string;
  @IsString()
  @Length(6)
  readonly password: string;
  @IsString()
  readonly username: string;
  @IsString()
  readonly displayName: string;
  @IsDate()
  readonly birthday: string;
  @IsString()
  readonly bio: string;
}
