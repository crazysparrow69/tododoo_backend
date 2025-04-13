import { IsNumber, IsOptional, IsString, Length, Min } from "class-validator";

export class UpdateColumnDto {
  @IsOptional()
  @IsString()
  @Length(1, 50)
  title?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;
}
