import { IsOptional, IsString, Length } from "class-validator";
import { COLOR_MAX, COLOR_MIN, ROADMAP } from "src/common/constants";

export class CreateRoadmapCategoryDto {
  @IsString()
  @Length(ROADMAP.CATEGORIES.TITLE.MIN, ROADMAP.CATEGORIES.TITLE.MAX)
  title: string;

  @IsString()
  @Length(COLOR_MIN, COLOR_MAX)
  color: string;
}

export class UpdateRoadmapCategoryDto {
  @IsOptional()
  @IsString()
  @Length(ROADMAP.CATEGORIES.TITLE.MIN, ROADMAP.CATEGORIES.TITLE.MAX)
  title?: string;

  @IsOptional()
  @IsString()
  @Length(COLOR_MIN, COLOR_MAX)
  color?: string;
}
