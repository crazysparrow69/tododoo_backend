import { Transform } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsDate,
  IsArray,
  Length,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';

import { Category } from 'src/category/category.schema';

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  @Length(3, 50)
  title: string;

  @IsString()
  @IsOptional()
  @Length(3, 1000)
  description: string;

  @IsArray()
  @IsOptional()
  categories: Category[];

  @IsBoolean()
  @IsOptional()
  isCompleted: boolean;

  @IsArray()
  @IsOptional()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  links: Array<string>;

  @IsDate()
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  deadline: Date;
}
