import { IsNumber, IsOptional, IsString, Length, Min } from "class-validator";

export class CreateRoadmapQuarterDto {
  @IsString()
  @Length(1, 50)
  title: string;

  @IsNumber()
  @Min(0)
  start: number;

  @IsNumber()
  @Min(0)
  end: number;
}

export class UpdateRoadmapQuarterDto {
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
