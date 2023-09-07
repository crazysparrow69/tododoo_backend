import { IsEmail, IsString, IsOptional } from 'class-validator';

export class QueryUserDto {
  @IsString()
  @IsOptional()
  username: string;

  @IsEmail()
  @IsOptional()
  email: string;
}
