import {
  ArrayMaxSize,
  IsArray,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from "class-validator";
import { BOARD, TASK } from "src/common/constants";

export class CreateBoardCategoryTaskDto {
  @IsString()
  @Length(TASK.TITLE.MIN, TASK.TITLE.MAX)
  title: string;

  @IsOptional()
  @IsString()
  @Length(TASK.DESCRIPTION.MIN, TASK.DESCRIPTION.MAX)
  description?: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  @ArrayMaxSize(BOARD.COLUMNS.TASKS.ASSIGNEE_IDS.MAX)
  assigneeIds?: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  @ArrayMaxSize(BOARD.COLUMNS.TASKS.TAG_IDS.MAX)
  tagIds?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;
}

export class UpdateBoardCategoryTaskDto {
  @IsOptional()
  @IsString()
  @Length(TASK.TITLE.MIN, TASK.TITLE.MAX)
  title?: string;

  @IsOptional()
  @IsString()
  @Length(TASK.DESCRIPTION.MIN, TASK.DESCRIPTION.MAX)
  description?: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  @ArrayMaxSize(BOARD.COLUMNS.TASKS.ASSIGNEE_IDS.MAX)
  assigneeIds?: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  @ArrayMaxSize(BOARD.COLUMNS.TASKS.TAG_IDS.MAX)
  tagIds?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;
}

export class MoveBoardCategoryTaskDto {
  @IsMongoId()
  targetColumnId: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;
}
