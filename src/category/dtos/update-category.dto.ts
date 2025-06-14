import { IsOptional, IsString, Length } from "class-validator";
import { CATEGORY, COLOR_MAX, COLOR_MIN } from "src/common/constants";

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @Length(CATEGORY.TITLE.MIN, CATEGORY.TITLE.MAX)
  title: string;

  @IsOptional()
  @IsString()
  @Length(COLOR_MIN, COLOR_MAX)
  color: string;
}
