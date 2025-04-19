import {
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from "class-validator";

export class CreateRoadmapCategoryRowTaskDto {
  @IsString()
  @Length(1, 50)
  title: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
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
  @Length(1, 50)
  title?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
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
}
