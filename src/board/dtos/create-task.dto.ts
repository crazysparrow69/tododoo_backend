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

export class CreateTaskDto {
  @IsString()
  @Length(1, 50)
  title: string;

  @IsOptional()
  @IsString()
  @Length(1, 1000)
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
