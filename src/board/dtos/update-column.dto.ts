import { IsNumber, IsOptional, IsString, Min } from "class-validator";

export class UpdateColumnDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;
}
