import {
  IsArray,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from "class-validator";

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  @MaxLength(10)
  assigneeIds?: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  @MaxLength(10)
  tagIds?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;
}
