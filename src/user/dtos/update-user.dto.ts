import { IsEmail, IsOptional, IsString, Length } from "class-validator";

export class UpdateUserDto {
  @IsString()
  @Length(3, 20)
  @IsOptional()
  username?: string;

  @IsEmail()
  @Length(1, 100)
  @IsOptional()
  email?: string;

  @IsString()
  @Length(24, 24)
  @IsOptional()
  profileEffectId?: string;

  @IsString()
  @Length(24, 24)
  @IsOptional()
  avatarEffectId?: string;
}
