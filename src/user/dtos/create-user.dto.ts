import { IsEmail, IsString, Length } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @Length(3, 20)
  username: string;

  @IsString()
  @Length(6, 20)
  password: string;

  @IsEmail()
  @Length(1, 100)
  email: string;
}
