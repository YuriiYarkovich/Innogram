import { IsDate, IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateAccountDto {
  constructor(
    email: string,
    password: string,
    username: string,
    birthday: string,
    bio: string,
  ) {
    this.email = email;
    this.password = password;
    this.username = username;
    this.birthday = birthday;
    this.bio = bio;
  }
  @IsEmail({}, { message: 'Email is not valid' })
  readonly email: string;

  @IsString()
  @Length(6, 36, { message: 'Password must have 6 to 36 characters' })
  readonly password: string;

  @IsString({ message: `Username must be a string` })
  readonly username: string;

  @IsString({ message: 'Birthday must be in format YYYY-MM-DD' })
  readonly birthday: string;

  @IsNotEmpty({ message: 'Bio is required' })
  readonly bio: string;
}
