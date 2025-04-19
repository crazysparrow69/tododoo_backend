import { IsNumber, IsOptional, IsString, Length, Min } from "class-validator";
import { ROADMAP } from "src/common/constants";

export class CreateRoadmapQuarterDto {
  @IsString()
  @Length(ROADMAP.QUARTERS.TITLE.MIN, ROADMAP.QUARTERS.TITLE.MAX)
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
  @Length(ROADMAP.QUARTERS.TITLE.MIN, ROADMAP.QUARTERS.TITLE.MAX)
  title?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  start?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  end?: number;
}
