import { Transform } from "class-transformer";
import { IsEmail, IsOptional, IsString, Length } from "class-validator";
import { USER } from "src/common/constants";

export class QueryUserDto {
  @IsOptional()
  @IsString()
  @Length(1, USER.USERNAME.MAX)
  username: string;

  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit: number;
}
