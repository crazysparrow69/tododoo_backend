import {
  IsEmail,
  IsMongoId,
  IsOptional,
  IsString,
  Length,
} from "class-validator";
import { USER } from "src/common/constants";

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Length(USER.USERNAME.MIN, USER.USERNAME.MAX)
  username?: string;

  @IsOptional()
  @IsMongoId()
  profileEffectId?: string;

  @IsOptional()
  @IsMongoId()
  avatarEffectId?: string;
}
