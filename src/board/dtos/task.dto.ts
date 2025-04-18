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
import {
  BOARD_COLUMN_TASK_ASSIGNEEIDS_MAX_LENGTH,
  BOARD_COLUMN_TASK_TAGIDS_MAX_LENGTH,
} from "src/common/constants";

export class CreateBoardCategoryTaskDto {
  @IsString()
  @Length(1, 50)
  title: string;

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  @ArrayMaxSize(BOARD_COLUMN_TASK_ASSIGNEEIDS_MAX_LENGTH)
  assigneeIds?: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  @ArrayMaxSize(BOARD_COLUMN_TASK_TAGIDS_MAX_LENGTH)
  tagIds?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;
}

export class UpdateBoardCategoryTaskDto {
  @IsOptional()
  @IsString()
  @Length(1, 50)
  title?: string;

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  @ArrayMaxSize(BOARD_COLUMN_TASK_ASSIGNEEIDS_MAX_LENGTH)
  assigneeIds?: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  @ArrayMaxSize(BOARD_COLUMN_TASK_TAGIDS_MAX_LENGTH)
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
