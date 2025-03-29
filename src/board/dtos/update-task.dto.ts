import {
  IsArray,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsMongoId()
  assigneeId?: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  tagIds?: string[];

  @IsOptional()
  @IsNumber()
  order?: number;
}
