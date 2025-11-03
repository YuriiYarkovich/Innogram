import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class LoginDto {
  constructor(email: string, password: string) {
    this.email = email;
    this.password = password;
  }

  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email is not valid' })
  readonly email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  @Length(6, 36, { message: 'Password must have 6 to 36 characters' })
  readonly password: string;
}
