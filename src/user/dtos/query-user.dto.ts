import { IsEmail, IsString, IsOptional, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryUserDto {
  @IsString()
  @Length(1, 20)
  @IsOptional()
  username: string;

  @IsEmail()
  @Length(1, 100)
  @IsOptional()
  email: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit: number;
}
