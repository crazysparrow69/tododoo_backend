import {
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from "class-validator";
import { ROADMAP } from "src/common/constants";

export class CreateRoadmapCategoryRowTaskDto {
  @IsString()
  @Length(
    ROADMAP.CATEGORIES.ROWS.TASKS.TITLE.MIN,
    ROADMAP.CATEGORIES.ROWS.TASKS.TITLE.MAX
  )
  title: string;

  @IsOptional()
  @IsNumber()
  @Min(ROADMAP.CATEGORIES.ROWS.TASKS.PROGRESS.MIN)
  @Max(ROADMAP.CATEGORIES.ROWS.TASKS.PROGRESS.MAX)
  progress?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  start?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  end?: number;
}

export class UpdateRoadmapCategoryRowTaskDto {
  @IsOptional()
  @IsString()
  @Length(
    ROADMAP.CATEGORIES.ROWS.TASKS.TITLE.MIN,
    ROADMAP.CATEGORIES.ROWS.TASKS.TITLE.MAX
  )
  title?: string;

  @IsOptional()
  @IsNumber()
  @Min(ROADMAP.CATEGORIES.ROWS.TASKS.PROGRESS.MIN)
  @Max(ROADMAP.CATEGORIES.ROWS.TASKS.PROGRESS.MAX)
  progress?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  start?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  end?: number;
}

export class MoveRoadmapCategoryRowTaskDto {
  @IsMongoId()
  toCategoryId: string;

  @IsMongoId()
  toRowId: string;

  @IsNumber()
  @Min(0)
  start: number;

  @IsNumber()
  @Min(0)
  end: number;
}
