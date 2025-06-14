import { IsEmail, IsString, Length, Matches } from "class-validator";
import { USER } from "src/common/constants";

export class SignupUserDto {
  @IsString()
  @Length(USER.USERNAME.MIN, USER.USERNAME.MAX)
  username: string;

  @IsString()
  @Matches(USER.PASSWORD.REGEX, {
    message: USER.PASSWORD.ERROR_MESSAGE,
  })
  password: string;

  @IsEmail()
  email: string;
}

export class SigninUserDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
