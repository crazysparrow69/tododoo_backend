import { IsEmail, IsString, Length } from "class-validator";
import { USER } from "src/common/constants";

export class SignupUserDto {
  @IsString()
  @Length(USER.USERNAME.MIN, USER.USERNAME.MAX)
  username: string;

  @IsString()
  @Length(USER.PASSWORD.MIN, USER.PASSWORD.MAX)
  password: string;

  @IsEmail()
  email: string;
}

export class SigninUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(USER.PASSWORD.MIN, USER.PASSWORD.MAX)
  password: string;
}
