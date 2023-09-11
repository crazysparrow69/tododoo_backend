import { Transform } from 'class-transformer';
import { IsString, IsOptional, IsBoolean, IsDate, IsArray } from 'class-validator';

import { Category } from 'src/category/category.schema';

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsArray()
  @IsOptional()
  categories: Category[];

  @IsBoolean()
  @IsOptional()
  isCompleted: boolean;

  @IsDate()
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  deadline: Date;
}