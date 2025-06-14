import { IsOptional, IsString } from "class-validator";

export class UpdateTagDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  color?: string;
}
