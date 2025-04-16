import { IsNumber, IsOptional, IsString, Length, Min } from "class-validator";

export class UpdateQuarterDto {
  @IsOptional()
  @IsString()
  @Length(1, 50)
  title: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  start: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  end: number;
}
