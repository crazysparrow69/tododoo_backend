import { IsEmail, IsString, IsOptional, Length } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @Length(3, 20)
  @IsOptional()
  username: string;

  @IsEmail()
  @Length(1, 100)
  @IsOptional()
  email: string;
}
