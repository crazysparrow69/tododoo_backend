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
  @ArrayMaxSize(10)
  assigneeIds?: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  @ArrayMaxSize(10)
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
  @ArrayMaxSize(10)
  assigneeIds?: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  @ArrayMaxSize(10)
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
