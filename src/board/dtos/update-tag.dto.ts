import { IsOptional, IsString, Length } from "class-validator";

export class UpdateTagDto {
  @IsOptional()
  @IsString()
  @Length(1, 20)
  title?: string;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  color?: string;
}
