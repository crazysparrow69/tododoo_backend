import { IsString, Length } from "class-validator";
import { USER } from "src/common/constants";

export class ChangePasswordDto {
  @IsString()
  @Length(USER.PASSWORD.MIN, USER.PASSWORD.MAX)
  oldPassword: string;

  @IsString()
  @Length(USER.PASSWORD.MIN, USER.PASSWORD.MAX)
  newPassword: string;
}
