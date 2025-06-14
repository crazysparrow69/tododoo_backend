import { IsString, Length, Matches } from "class-validator";
import { USER } from "src/common/constants";

export class ChangePasswordDto {
  @IsString()
  oldPassword: string;

  @IsString()
  @Matches(USER.PASSWORD.REGEX, {
    message: USER.PASSWORD.ERROR_MESSAGE,
  })
  newPassword: string;
}
